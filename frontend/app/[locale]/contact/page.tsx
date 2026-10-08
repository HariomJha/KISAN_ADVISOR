"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  Mail,
  Phone,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Clock3,
  ArrowUpRight,
  ShieldCheck,
  Sprout,
  Bug,
  FlaskConical,
  Landmark,
  Wrench,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  FileText,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Constants & types                                                         */
/* -------------------------------------------------------------------------- */

const EMAIL = "support@kisanadvisor.com";
const PHONE_DISPLAY = "+91 7073547009";
const PHONE_TEL = "+917073547009";
const whatsappUrl = (text: string) =>
  `https://wa.me/917073547009?text=${encodeURIComponent(text)}`;

const MESSAGE_LIMIT = 1000;
const DRAFT_KEY = "kisan-contact-draft";

type ContactMethod = "Email" | "Phone call" | "WhatsApp";
const contactMethods: ContactMethod[] = ["Email", "Phone call", "WhatsApp"];

type ContactData = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  method: ContactMethod;
  message: string;
};

type FieldName = "name" | "email" | "phone" | "message";
type FormErrors = Partial<Record<FieldName, string>>;

type Topic = {
  label: string;
  icon: LucideIcon;
  hint: string;
  template: string;
};

const topics: Topic[] = [
  {
    label: "Farming Guidance",
    icon: Sprout,
    hint: "Tell us your crop, crop age, location, and what you need help with.",
    template:
      "Crop:\nCrop age or stage:\nLocation (village, district):\nWhat I need help with:\n",
  },
  {
    label: "Crop Disease Assistance",
    icon: Bug,
    hint: "Mention the symptoms, when they started, and which part of the crop is affected.",
    template:
      "Crop:\nSymptoms I see:\nStarted (how many days ago):\nPart affected (leaf, stem, fruit, root):\nI will send photos on WhatsApp.\n",
  },
  {
    label: "Fertilizer & Seeds Inquiry",
    icon: FlaskConical,
    hint: "Mention your crop, land size, crop stage, and the product you need.",
    template:
      "Crop:\nLand size:\nCrop stage:\nProduct I am looking for:\nLocation (village, district):\n",
  },
  {
    label: "Government Schemes Help",
    icon: Landmark,
    hint: "Tell us which government scheme or benefit you need help with.",
    template:
      "Scheme or benefit name:\nState and district:\nWhere I am stuck (application, documents, payment):\n",
  },
  {
    label: "Technical Support",
    icon: Wrench,
    hint: "Describe the website or app problem and include any error message.",
    template:
      "What I was trying to do:\nWhat happened instead:\nError message (if any):\nDevice and browser:\n",
  },
  {
    label: "Other",
    icon: HelpCircle,
    hint: "Describe your question and include any useful details.",
    template: "",
  },
];

const faqs = [
  {
    q: "How quickly will I get a reply?",
    a: "During support hours we typically reply within 2 hours. Messages sent outside those hours are answered when we reopen.",
  },
  {
    q: "Can I send photos of my crop?",
    a: "Yes. WhatsApp is the easiest way to share clear photos of leaves, stems, fruit, or the whole field.",
  },
  {
    q: "What details help you answer faster?",
    a: "Your crop, its age or stage, your village and district, and what you have noticed. Choosing a topic above shows exactly what to include.",
  },
  {
    q: "My problem is urgent. What should I do?",
    a: "Call us during support hours, or send a WhatsApp message with a photo. Both are quicker than email.",
  },
];

const initialContactData: ContactData = {
  name: "",
  email: "",
  phone: "",
  topic: topics[0].label,
  method: "Email",
  message: "",
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:\+?91)?[6-9]\d{9}$/;
const normalizePhone = (value: string) => value.replace(/[\s\-()]/g, "");

function validate(data: ContactData): FormErrors {
  const errors: FormErrors = {};
  const needsPhone = data.method !== "Email";

  const name = data.name.trim();
  if (!name) errors.name = "Enter your name";
  else if (name.length < 2) errors.name = "That name looks too short";

  const email = data.email.trim();
  if (!email) {
    if (!needsPhone) errors.email = "Enter your email so we can reply";
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "Check your email, for example name@example.com";
  }

  const phone = normalizePhone(data.phone);
  if (!phone) {
    if (needsPhone) {
      errors.phone = `Enter your mobile number so we can reach you by ${data.method === "WhatsApp" ? "WhatsApp" : "phone"
        }`;
    }
  } else if (!PHONE_RE.test(phone)) {
    errors.phone = "Enter a 10-digit mobile number";
  }

  const message = data.message.trim();
  if (!message) errors.message = "Tell us how we can help";
  else if (message.length < 10)
    errors.message = "Add a few more details (at least 10 characters)";

  return errors;
}

/** Support hours are Mon-Sat, 9 AM to 6 PM India time. */
function getSupportStatus(now = new Date()) {
  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = ist.getDay(); // 0 = Sunday
  const hour = ist.getHours() + ist.getMinutes() / 60;
  const workday = day >= 1 && day <= 6;

  if (workday && hour >= 9 && hour < 18) {
    return {
      open: true,
      label: "We're online now",
      detail: "Closes today at 6 PM",
      nextOpen: "",
    };
  }

  let nextOpen = "today at 9 AM";
  if (!workday || (workday && hour >= 18)) {
    nextOpen = day === 6 || day === 0 ? "Monday at 9 AM" : "tomorrow at 9 AM";
  }

  return {
    open: false,
    label: "We're offline right now",
    detail: `Back ${nextOpen}`,
    nextOpen,
  };
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-2xl border-2 px-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 ${hasError
    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
    : "border-slate-100 bg-slate-50 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
  }`;

/**
 * Replace this with a real request when your API is ready, for example:
 *
 * const res = await fetch("/api/contact", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify(data),
 * });
 * if (!res.ok) throw new Error("Request failed");
 */
async function sendInquiry(data: ContactData): Promise<void> {
  void data;
  await new Promise((resolve) => setTimeout(resolve, 1200));
}

/* -------------------------------------------------------------------------- */
/*  Small components                                                          */
/* -------------------------------------------------------------------------- */

const reveal = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.45, ease: "easeOut" as const },
  }),
};

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden pt-1.5 text-xs font-semibold text-red-600"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

type ContactCardProps = {
  index: number;
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  href: string;
  external?: boolean;
  copyValue?: string;
  copied?: boolean;
  onCopy?: () => void;
};

function ContactCard({
  index,
  icon: Icon,
  title,
  description,
  value,
  href,
  external,
  copyValue,
  copied,
  onCopy,
}: ContactCardProps) {
  return (
    <motion.div
      custom={index}
      variants={reveal}
      initial="hidden"
      animate="visible"
      className="group flex items-stretch rounded-3xl border border-emerald-100 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-emerald-300 hover:shadow-[0_20px_50px_rgba(16,185,129,0.14)]"
    >
      <a
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : undefined)}
        className="flex min-w-0 flex-1 gap-4 rounded-3xl p-6 outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-100">
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
            <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-500" />
          </div>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
          <span className="mt-3 block break-all text-sm font-bold text-emerald-700">
            {value}
          </span>
        </div>
      </a>

      {copyValue && onCopy && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${title.toLowerCase()} details`}
          className="my-4 mr-4 flex w-16 shrink-0 flex-col items-center justify-center gap-1 self-center rounded-2xl border border-slate-100 py-3 text-xs font-bold text-slate-500 outline-none transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-500/30"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "done" : "copy"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-1"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </motion.span>
          </AnimatePresence>
        </button>
      )}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

type Submission = {
  name: string;
  method: ContactMethod;
  contact: string;
  topic: string;
  ref: string;
};

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactData>(initialContactData);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {}
  );
  const [attempted, setAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Submission | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [status, setStatus] = useState<ReturnType<
    typeof getSupportStatus
  > | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const fieldRefs = useRef<
    Partial<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>
  >({});

  const errors = useMemo(() => validate(formData), [formData]);
  const showError = (field: FieldName) =>
    touched[field] || attempted ? errors[field] : undefined;

  const activeTopic = topics.find((t) => t.label === formData.topic) ?? topics[0];
  const messageLength = formData.message.length;
  const nearLimit = messageLength > MESSAGE_LIMIT * 0.9;
  const emailRequired = formData.method === "Email";
  const phoneRequired = !emailRequired;

  /* Live "open / closed" indicator */
  useEffect(() => {
    setStatus(getSupportStatus());
    const id = setInterval(() => setStatus(getSupportStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  /* Restore unsent draft + preselect topic from ?topic= */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<ContactData>;
        const restored: Partial<ContactData> = {};
        if (typeof saved.name === "string") restored.name = saved.name;
        if (typeof saved.email === "string") restored.email = saved.email;
        if (typeof saved.phone === "string") restored.phone = saved.phone;
        if (typeof saved.message === "string")
          restored.message = saved.message.slice(0, MESSAGE_LIMIT);
        if (saved.topic && topics.some((t) => t.label === saved.topic))
          restored.topic = saved.topic;
        if (saved.method && contactMethods.includes(saved.method))
          restored.method = saved.method;

        if (restored.name || restored.email || restored.phone || restored.message) {
          setFormData((prev) => ({ ...prev, ...restored }));
          setDraftRestored(true);
        }
      }
    } catch {
      /* storage unavailable, ignore */
    }

    const topicParam = new URLSearchParams(window.location.search).get("topic");
    if (topicParam && topics.some((t) => t.label === topicParam)) {
      setFormData((prev) => ({ ...prev, topic: topicParam }));
    }

    setDraftLoaded(true);
  }, []);

  /* Auto-save draft so nothing is lost on a bad network */
  useEffect(() => {
    if (!draftLoaded || submitted) return;
    const timer = setTimeout(() => {
      try {
        const hasContent =
          formData.name || formData.email || formData.phone || formData.message;
        if (hasContent) localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        else localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData, draftLoaded, submitted]);

  /* ----------------------------- handlers --------------------------------- */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? value.replace(/[^\d+\s-]/g, "") : value,
    }));
    setSubmitError(null);
  };

  const handleBlur = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const field = e.target.name as FieldName;
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement("textarea");
      el.value = value;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 2000);
  };

  const applyTemplate = () => {
    if (!activeTopic.template) return;
    setFormData((prev) => ({
      ...prev,
      message: prev.message.trim()
        ? `${prev.message.trimEnd()}\n\n${activeTopic.template}`.slice(
          0,
          MESSAGE_LIMIT
        )
        : activeTopic.template,
    }));
    requestAnimationFrame(() => {
      const el = fieldRefs.current.message;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  };

  const resetForm = () => {
    setFormData(initialContactData);
    setTouched({});
    setAttempted(false);
    setSubmitError(null);
    setDraftRestored(false);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  };

  const handleMessageKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setAttempted(true);

    const firstInvalid = (
      ["name", "email", "phone", "message"] as FieldName[]
    ).find((field) => errors[field]);

    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await sendInquiry(formData);

      setSubmitted({
        name: formData.name.trim().split(" ")[0],
        method: formData.method,
        contact:
          formData.method === "Email"
            ? formData.email.trim()
            : normalizePhone(formData.phone),
        topic: formData.topic,
        ref: `KA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      });
      resetForm();
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setSubmitError(
        "We couldn't send your message. Check your connection and try again, or reach us on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const replyEstimate = status?.open
    ? "usually within 2 hours"
    : status
      ? `when we reopen ${status.nextOpen}`
      : "as soon as possible";

  /* ------------------------------ render ---------------------------------- */

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f3faf5] via-white to-[#eef8f0]">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-lime-200/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-100/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            custom={0}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="mx-auto mb-14 max-w-3xl text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Kisan Advisor Support
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              We&apos;d Love to{" "}
              <span className="text-emerald-600">Hear From You</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Questions about your crops, farming techniques, weather, or
              technical support? Pick the way that is easiest for you.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.5fr]">
            {/* ------------------------- LEFT SIDE -------------------------- */}
            <section className="space-y-5" aria-label="Ways to contact us">
              <ContactCard
                index={1}
                icon={Mail}
                title="Email Us"
                description="We typically reply within 2 hours."
                value={EMAIL}
                href={`mailto:${EMAIL}`}
                copyValue={EMAIL}
                copied={copiedKey === "email"}
                onCopy={() => handleCopy("email", EMAIL)}
              />

              <ContactCard
                index={2}
                icon={Phone}
                title="Call Us"
                description="Mon-Sat, 9 AM to 6 PM"
                value={PHONE_DISPLAY}
                href={`tel:${PHONE_TEL}`}
                copyValue={PHONE_DISPLAY}
                copied={copiedKey === "phone"}
                onCopy={() => handleCopy("phone", PHONE_DISPLAY)}
              />

              <ContactCard
                index={3}
                icon={MessageCircle}
                title="WhatsApp"
                description="Send us crop photos and questions."
                value="Start a conversation"
                href={whatsappUrl("Hello Kisan Advisor, I need farming support.")}
                external
              />

              {/* Support info with live status */}
              <motion.div
                custom={4}
                variants={reveal}
                initial="hidden"
                animate="visible"
                className="rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-6 text-white shadow-xl"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-200">
                      Support Hours
                    </p>
                    <p className="font-bold">Mon - Sat, 9 AM - 6 PM</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 rounded-2xl bg-black/15 px-4 py-3"
                  role="status"
                  aria-live="polite"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    {status?.open && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status?.open
                          ? "bg-lime-300"
                          : status
                            ? "bg-amber-300"
                            : "bg-white/40"
                        }`}
                    />
                  </span>
                  <div className="text-sm">
                    <p className="font-bold">
                      {status ? status.label : "Checking availability"}
                    </p>
                    {status && (
                      <p className="text-emerald-200">{status.detail}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3 border-t border-white/10 pt-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <p className="text-sm leading-6 text-emerald-50">
                    Your information is only used to respond to your farming
                    inquiry.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* ------------------------- RIGHT SIDE ------------------------- */}
            <section
              ref={panelRef}
              className="scroll-mt-6 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-9"
            >
              <AnimatePresence mode="wait" initial={false}>
                {submitted ? (
                  /* ---------------------- Success panel ------------------- */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-6 text-center"
                    role="status"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                    >
                      <CheckCircle2 className="h-10 w-10" />
                    </motion.div>

                    <h2 className="mt-6 text-3xl font-black text-slate-900">
                      Thank you, {submitted.name}
                    </h2>
                    <p className="mt-2 max-w-md text-slate-600">
                      We received your message about{" "}
                      <strong className="text-slate-800">{submitted.topic}</strong>
                      . Our team will reach you by {submitted.method.toLowerCase()}{" "}
                      at{" "}
                      <strong className="break-all text-slate-800">
                        {submitted.contact}
                      </strong>{" "}
                      {replyEstimate}.
                    </p>

                    <p className="mt-5 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600">
                      Reference: {submitted.ref}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={whatsappUrl(
                          `Hello Kisan Advisor, I just sent a message (ref ${submitted.ref}). Sending crop photos here.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-emerald-700/20 outline-none transition hover:bg-emerald-800 focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Send photos on WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => setSubmitted(null)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 px-6 py-3.5 font-bold text-slate-700 outline-none transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Send another message
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* ------------------------- Form ------------------------- */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="mb-8">
                      <p className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-600">
                        Contact our team
                      </p>
                      <h2 className="text-3xl font-black text-slate-900">
                        Send an Inquiry
                      </h2>
                      <p className="mt-2 text-slate-500">
                        Fill in the details and one of our agronomists will get
                        back to you.
                      </p>
                    </div>

                    <AnimatePresence initial={false}>
                      {draftRestored && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            <span>We restored the message you didn&apos;t send.</span>
                            <button
                              type="button"
                              onClick={resetForm}
                              className="shrink-0 font-bold underline underline-offset-2 outline-none focus-visible:ring-4 focus-visible:ring-amber-400/40"
                            >
                              Start fresh
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form
                      ref={formRef}
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-7"
                    >
                      {/* Topic picker */}
                      <fieldset>
                        <legend className="mb-3 block text-sm font-bold text-slate-700">
                          What do you need help with?
                        </legend>

                        <div
                          role="radiogroup"
                          aria-label="Topic"
                          className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
                        >
                          {topics.map((topic) => {
                            const selected = formData.topic === topic.label;
                            const Icon = topic.icon;
                            return (
                              <button
                                key={topic.label}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    topic: topic.label,
                                  }))
                                }
                                className={`relative flex items-center gap-2.5 rounded-2xl border-2 px-3.5 py-3 text-left text-sm font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-emerald-500/30 ${selected
                                    ? "border-emerald-600 text-white"
                                    : "border-slate-100 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                  }`}
                              >
                                {selected && (
                                  <motion.span
                                    layoutId="topic-highlight"
                                    className="absolute inset-0 rounded-[0.9rem] bg-emerald-600 shadow-md shadow-emerald-600/25"
                                    transition={{
                                      type: "spring",
                                      stiffness: 420,
                                      damping: 34,
                                    }}
                                  />
                                )}
                                <Icon className="relative h-4 w-4 shrink-0" />
                                <span className="relative leading-tight">
                                  {topic.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Dynamic help + template */}
                        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3.5">
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={activeTopic.label}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.15 }}
                              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <p className="text-sm leading-6 text-emerald-800">
                                {activeTopic.hint}
                              </p>
                              {activeTopic.template && (
                                <button
                                  type="button"
                                  onClick={applyTemplate}
                                  className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-700 shadow-sm outline-none ring-1 ring-emerald-200 transition hover:bg-emerald-100 focus-visible:ring-4 focus-visible:ring-emerald-500/30 sm:self-auto"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  Fill a template
                                </button>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </fieldset>

                      {/* Preferred contact method */}
                      <fieldset>
                        <legend className="mb-3 block text-sm font-bold text-slate-700">
                          How should we reach you?
                        </legend>
                        <div
                          role="radiogroup"
                          aria-label="Preferred contact method"
                          className="inline-flex w-full rounded-2xl bg-slate-100 p-1 sm:w-auto"
                        >
                          {contactMethods.map((method) => {
                            const selected = formData.method === method;
                            return (
                              <button
                                key={method}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() =>
                                  setFormData((prev) => ({ ...prev, method }))
                                }
                                className={`relative flex-1 rounded-xl px-4 py-2 text-sm font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-emerald-500/30 sm:flex-none ${selected
                                    ? "text-emerald-800"
                                    : "text-slate-500 hover:text-slate-800"
                                  }`}
                              >
                                {selected && (
                                  <motion.span
                                    layoutId="method-highlight"
                                    className="absolute inset-0 rounded-xl bg-white shadow-sm"
                                    transition={{
                                      type: "spring",
                                      stiffness: 420,
                                      damping: 34,
                                    }}
                                  />
                                )}
                                <span className="relative">{method}</span>
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>

                      {/* Name / Email / Phone */}
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-bold text-slate-700"
                          >
                            Full Name *
                          </label>
                          <input
                            id="name"
                            name="name"
                            ref={(el) => {
                              fieldRefs.current.name = el;
                            }}
                            autoComplete="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Ramesh Kumar"
                            aria-invalid={!!showError("name")}
                            aria-describedby="name-error"
                            className={inputClass(!!showError("name"))}
                          />
                          <FieldError id="name-error" message={showError("name")} />
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="mb-2 block text-sm font-bold text-slate-700"
                          >
                            Mobile Number{" "}
                            {phoneRequired ? (
                              "*"
                            ) : (
                              <span className="font-medium text-slate-400">
                                (optional)
                              </span>
                            )}
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            ref={(el) => {
                              fieldRefs.current.phone = el;
                            }}
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="98765 43210"
                            aria-invalid={!!showError("phone")}
                            aria-describedby="phone-error"
                            className={inputClass(!!showError("phone"))}
                          />
                          <FieldError
                            id="phone-error"
                            message={showError("phone")}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-bold text-slate-700"
                          >
                            Email Address{" "}
                            {emailRequired ? (
                              "*"
                            ) : (
                              <span className="font-medium text-slate-400">
                                (optional)
                              </span>
                            )}
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            inputMode="email"
                            ref={(el) => {
                              fieldRefs.current.email = el;
                            }}
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="ramesh@example.com"
                            aria-invalid={!!showError("email")}
                            aria-describedby="email-error"
                            className={inputClass(!!showError("email"))}
                          />
                          <FieldError
                            id="email-error"
                            message={showError("email")}
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor="message"
                            className="text-sm font-bold text-slate-700"
                          >
                            Your Message *
                          </label>
                          <span
                            className={`text-xs font-semibold ${nearLimit ? "text-amber-600" : "text-slate-400"
                              }`}
                          >
                            {messageLength}/{MESSAGE_LIMIT}
                          </span>
                        </div>

                        <textarea
                          id="message"
                          name="message"
                          ref={(el) => {
                            fieldRefs.current.message = el;
                          }}
                          rows={6}
                          maxLength={MESSAGE_LIMIT}
                          value={formData.message}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onKeyDown={handleMessageKeyDown}
                          placeholder="Describe your crop, symptoms, field conditions, or what you need help with..."
                          aria-invalid={!!showError("message")}
                          aria-describedby="message-error"
                          className={`min-h-[170px] resize-y py-4 ${inputClass(
                            !!showError("message")
                          )}`}
                        />

                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            className={`h-full rounded-full ${nearLimit ? "bg-amber-400" : "bg-emerald-500"
                              }`}
                            animate={{
                              width: `${(messageLength / MESSAGE_LIMIT) * 100}%`,
                            }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>

                        <FieldError
                          id="message-error"
                          message={showError("message")}
                        />
                      </div>

                      {/* Submit error */}
                      <AnimatePresence initial={false}>
                        {submitError && (
                          <motion.div
                            role="alert"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                              {submitError}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Bottom */}
                      <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs leading-5 text-slate-400">
                          We respect your privacy and only use your details to
                          respond.
                          <span className="hidden sm:block">
                            Tip: press Ctrl + Enter to send.
                          </span>
                        </div>

                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileTap={{ scale: 0.97 }}
                          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-7 py-4 font-extrabold text-white shadow-lg shadow-emerald-700/20 outline-none transition-colors duration-300 hover:bg-emerald-800 focus-visible:ring-4 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Message
                              <Send className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-1" />
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* FAQ */}
          <section
            aria-labelledby="faq-heading"
            className="mx-auto mt-20 max-w-3xl"
          >
            <h2
              id="faq-heading"
              className="mb-6 text-center text-3xl font-black text-slate-900"
            >
              Quick answers
            </h2>

            <div className="divide-y divide-emerald-100 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
              {faqs.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${i}`}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-bold text-slate-900 outline-none transition-colors hover:bg-emerald-50/60 focus-visible:bg-emerald-50 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-emerald-500/30"
                    >
                      {faq.q}
                      <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0 text-emerald-600"
                      >
                        <ChevronDown className="h-5 w-5" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          id={`faq-panel-${i}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="px-6 pb-5 leading-7 text-slate-600">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </MotionConfig>
  );
}
