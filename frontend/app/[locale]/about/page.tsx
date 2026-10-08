"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  Sprout,
  Bug,
  FlaskConical,
  Landmark,
  MessageCircle,
  ArrowRight,
  Check,
  Languages,
  MapPin,
  ShieldCheck,
  Handshake,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Content (edit freely, this is the only place you need to touch for copy)   */
/* -------------------------------------------------------------------------- */

type Area = {
  /** Must match a topic label on the Contact page so the form preselects it. */
  label: string;
  short: string;
  icon: LucideIcon;
  summary: string;
  youTell: string[];
  youGet: string[];
};

const areas: Area[] = [
  {
    label: "Farming Guidance",
    short: "Crop guidance",
    icon: Sprout,
    summary:
      "Practical advice for each stage of your crop, from preparing the field to the days before harvest.",
    youTell: ["Your crop and its age or stage", "Your village and district", "What you are planning or unsure about"],
    youGet: ["Clear next steps in simple language", "Advice that fits your season and area", "A suggestion to see a local expert when needed"],
  },
  {
    label: "Crop Disease Assistance",
    short: "Crop disease",
    icon: Bug,
    summary:
      "Help working out what is wrong with a crop and what to do about it before it spreads.",
    youTell: ["Symptoms you can see", "When they started", "Which part of the plant is affected"],
    youGet: ["Likely causes to check", "Steps to limit the damage", "What to watch for over the next few days"],
  },
  {
    label: "Fertilizer & Seeds Inquiry",
    short: "Fertilizer and seeds",
    icon: FlaskConical,
    summary:
      "Help choosing inputs that suit your crop, soil, and land size, so you spend only where it counts.",
    youTell: ["Your crop and land size", "Current crop stage", "What you already use"],
    youGet: ["Options matched to your crop", "When and how much to apply", "Things to avoid"],
  },
  {
    label: "Government Schemes Help",
    short: "Government schemes",
    icon: Landmark,
    summary:
      "Guidance on schemes and benefits you may be eligible for, and how to apply without missing a step.",
    youTell: ["The scheme you are interested in", "Your state and district", "Where you are stuck"],
    youGet: ["A plain explanation of the scheme", "Documents you will need", "Where and how to apply"],
  },
];

const steps = [
  {
    title: "Tell us what is happening",
    body: "Send a message, call, or share photos on WhatsApp. Say it the way you would tell a neighbour.",
  },
  {
    title: "We look at your situation",
    body: "We consider your crop, its stage, and your location, then work out what matters most right now.",
  },
  {
    title: "You get clear next steps",
    body: "You receive advice you can act on, and we say so honestly when something needs a local expert.",
  },
];

const values = [
  {
    icon: Languages,
    title: "Plain language first",
    body: "Good advice is useless if it is hard to follow. We explain things simply and skip the jargon.",
  },
  {
    icon: MapPin,
    title: "Your field, not an average one",
    body: "Soil, season, and location change the answer. We ask before we advise.",
  },
  {
    icon: Handshake,
    title: "Honest about limits",
    body: "When we are not sure, we say so and point you to your local agriculture office or Krishi Vigyan Kendra.",
  },
  {
    icon: ShieldCheck,
    title: "Your details stay yours",
    body: "What you share is used only to answer your question.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Hero illustration: crop rows that draw themselves once on load            */
/* -------------------------------------------------------------------------- */

function FieldRows() {
  const rows = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg
      viewBox="0 0 400 380"
      role="img"
      aria-label="Rows of crops stretching toward the horizon"
      className="h-full w-full"
    >
      <motion.circle
        cx="318"
        cy="62"
        r="30"
        className="fill-lime-300/70"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
        style={{ transformOrigin: "318px 62px" }}
      />
      {rows.map((i) => (
        <motion.path
          key={i}
          d={`M ${i * 44} 390 C ${i * 44 + 40} 290, ${170 + i * 16} 230, 410 ${90 + i * 34
            }`}
          fill="none"
          strokeWidth={i % 2 === 0 ? 5 : 3}
          strokeLinecap="round"
          className={i % 2 === 0 ? "stroke-emerald-600" : "stroke-emerald-300"}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.15 * i, duration: 1.1, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function AboutPage() {
  const [activeLabel, setActiveLabel] = useState(areas[0].label);
  const active = areas.find((a) => a.label === activeLabel) ?? areas[0];
  const ActiveIcon = active.icon;

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-gradient-to-br from-[#f3faf5] via-white to-[#eef8f0] text-slate-900">
        {/* ------------------------------ Hero ------------------------------ */}
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-24">
          <div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Farming advice that fits your field, not a textbook.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Kisan Advisor helps farmers get clear answers about crops,
              diseases, inputs, and government schemes, without having to travel
              to find someone to ask.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-7 py-4 font-extrabold text-white shadow-lg shadow-emerald-700/20 outline-none transition hover:bg-emerald-800 focus-visible:ring-4 focus-visible:ring-emerald-500/40"
              >
                Ask a question
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#what-we-help-with"
                className="inline-flex items-center justify-center rounded-2xl border-2 border-emerald-200 bg-white px-7 py-4 font-bold text-emerald-800 outline-none transition hover:border-emerald-400 hover:bg-emerald-50 focus-visible:ring-4 focus-visible:ring-emerald-500/30"
              >
                See what we help with
              </a>
            </div>
          </div>

          <div className="mx-auto aspect-[400/380] w-full max-w-md overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:max-w-none">
            <FieldRows />
          </div>
        </section>

        {/* ------------------------ What we help with ----------------------- */}
        <section
          id="what-we-help-with"
          className="mx-auto max-w-7xl scroll-mt-6 px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              What would you like help with?
            </h2>
            <p className="mt-3 text-slate-600">
              Pick a topic to see what to tell us and what you can expect back.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.4fr]">
            {/* Topic selector */}
            <div
              role="tablist"
              aria-label="Areas we help with"
              className="flex flex-wrap gap-2.5 lg:flex-col"
            >
              {areas.map((area) => {
                const selected = area.label === activeLabel;
                const Icon = area.icon;
                return (
                  <button
                    key={area.label}
                    role="tab"
                    type="button"
                    id={`tab-${area.short}`}
                    aria-selected={selected}
                    aria-controls="area-panel"
                    onClick={() => setActiveLabel(area.label)}
                    className={`relative flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-emerald-500/30 ${selected
                      ? "border-emerald-600 text-white"
                      : "border-emerald-100 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="area-highlight"
                        className="absolute inset-0 rounded-[0.9rem] bg-emerald-700 shadow-lg shadow-emerald-700/20"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon className="relative h-5 w-5 shrink-0" />
                    <span className="relative">{area.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Detail panel */}
            <div
              id="area-panel"
              role="tabpanel"
              aria-labelledby={`tab-${active.short}`}
              className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-9"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <ActiveIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold">{active.label}</h3>
                      <p className="mt-2 max-w-xl leading-7 text-slate-600">
                        {active.summary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div>
                      <h4 className="mb-3 text-sm font-bold text-slate-500">
                        You tell us
                      </h4>
                      <ul className="space-y-2.5">
                        {active.youTell.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2.5 text-sm leading-6 text-slate-700"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="mb-3 text-sm font-bold text-emerald-700">
                        You get back
                      </h4>
                      <ul className="space-y-2.5">
                        {active.youGet.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2.5 text-sm leading-6 text-slate-700"
                          >
                            <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link
                    href={`/contact?topic=${encodeURIComponent(active.label)}`}
                    className="group mt-9 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-emerald-700/20 outline-none transition hover:bg-emerald-800 focus-visible:ring-4 focus-visible:ring-emerald-500/40"
                  >
                    Ask about {active.short.toLowerCase()}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ---------------------------- How it works ------------------------ */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
            How it works
          </h2>

          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <li key={step.title} className="relative">
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-12 top-6 hidden h-px w-[calc(100%-2rem)] bg-emerald-200 md:block"
                  />
                )}
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-lg font-black text-white ring-8 ring-[#f3faf5]">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-xl font-extrabold">{step.title}</h3>
                <p className="mt-2 max-w-sm leading-7 text-slate-600">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------ Mission --------------------------- */}
        <section className="my-8 bg-gradient-to-br from-emerald-800 to-emerald-950 px-4 py-20 text-white sm:px-6 lg:px-8">
          <p className="mx-auto max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Good farming decisions shouldn&apos;t depend on who you happen to
            know.
          </p>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-emerald-100">
            Our job is to put reliable, understandable advice within reach of
            every farmer who asks for it.
          </p>
        </section>

        {/* ------------------------------ Values ---------------------------- */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
            How we work
          </h2>

          <dl className="mt-10 grid gap-x-16 md:grid-cols-2">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex gap-5 border-t border-emerald-100 py-7"
              >
                <Icon className="mt-1 h-6 w-6 shrink-0 text-emerald-600" />
                <div>
                  <dt className="text-lg font-extrabold">{title}</dt>
                  <dd className="mt-1.5 max-w-md leading-7 text-slate-600">
                    {body}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {/* ------------------------------- CTA ------------------------------ */}
        <section className="mx-auto max-w-4xl px-4 pb-24 pt-8 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Not sure where to start?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Send us a message or a photo of your crop. We will tell you what to
            do next.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-7 py-4 font-extrabold text-white shadow-lg shadow-emerald-700/20 outline-none transition hover:bg-emerald-800 focus-visible:ring-4 focus-visible:ring-emerald-500/40"
            >
              Contact us
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={`https://wa.me/917073547009?text=${encodeURIComponent(
                "Hello Kisan Advisor, I need farming support."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-white px-7 py-4 font-bold text-emerald-800 outline-none transition hover:border-emerald-400 hover:bg-emerald-50 focus-visible:ring-4 focus-visible:ring-emerald-500/30"
            >
              <MessageCircle className="h-5 w-5" />
              Message on WhatsApp
            </a>
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}
