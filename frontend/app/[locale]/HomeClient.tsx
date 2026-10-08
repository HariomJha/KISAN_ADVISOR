"use client";

import { useEffect, useState } from "react";
import {
    AnimatePresence,
    MotionConfig,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";
import {
    ArrowRight,
    Bug,
    Check,
    FlaskConical,
    Landmark,
    MapPin,
    MessageCircle,
    Pause,
    Play,
    Ruler,
    Sprout,
    TrendingUp,
    type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/routing";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type ServiceId = "advice" | "disease" | "inputs" | "schemes";

export type HomeCopy = {
    title: string;
    subtitle: string;
    cta: string;
    ctaSecondary: string;
    points: string[];
    chips: { location: string; size: string };
    services: {
        title: string;
        subtitle: string;
        featured: { title: string; body: string; cta: string };
        items: { id: ServiceId; title: string; body: string; cta: string }[];
    };
    how: {
        title: string;
        subtitle: string;
        pause: string;
        play: string;
        steps: { title: string; body: string }[];
        placeholder: string;
        sizeLabel: string;
        unit: string;
        ranks: string[];
        note: string;
    };
    final: { title: string; body: string };
};

/**
 * Where each service card goes. Change these hrefs to your own service pages
 * whenever they exist. For now they open the contact form with the topic
 * already selected.
 */
const serviceMeta: Record<ServiceId, { icon: LucideIcon; href: string }> = {
    advice: { icon: Sprout, href: "/contact?topic=Farming%20Guidance" },
    disease: { icon: Bug, href: "/contact?topic=Crop%20Disease%20Assistance" },
    inputs: {
        icon: FlaskConical,
        href: "/contact?topic=Fertilizer%20%26%20Seeds%20Inquiry",
    },
    schemes: {
        icon: Landmark,
        href: "/contact?topic=Government%20Schemes%20Help",
    },
};

const CROP_FINDER_HREF = "/services/best-crop";
const STEP_DURATION_MS = 4500;
const MAX_ACRES = 50;

/*
 * The "!" prefix on a few text colours below is deliberate. If your
 * globals.css has plain `a { color: ... }` or `h2 { color: ... }` rules that
 * are NOT inside `@layer base`, Tailwind v4 loses to them. Once you wrap those
 * rules in @layer base (see my notes) the "!" is harmless.
 */
const btnBase =
    "group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-7 font-extrabold !no-underline outline-none transition focus-visible:ring-4 focus-visible:ring-emerald-500/40 sm:w-auto";
const btnPrimary = `${btnBase} bg-emerald-700 !text-white shadow-lg shadow-emerald-700/20 hover:-translate-y-0.5 hover:bg-emerald-800`;
const btnGhost = `${btnBase} border-2 border-emerald-200 bg-white !text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50`;
const btnLight = `${btnBase} bg-white !text-emerald-800 hover:-translate-y-0.5 hover:shadow-xl`;

const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

/* -------------------------------------------------------------------------- */
/*  Motion presets                                                            */
/* -------------------------------------------------------------------------- */

const rise: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
    }),
};

const inView = {
    initial: "hidden",
    whileInView: "show",
    viewport: { once: true, margin: "-60px" },
} as const;

/* -------------------------------------------------------------------------- */
/*  Hero illustration: a field that grows and sways                           */
/* -------------------------------------------------------------------------- */

const svgOrigin = { transformBox: "fill-box", transformOrigin: "50% 100%" } as const;

function Crop({ delay, sway }: { delay: number; sway: number }) {
    return (
        <motion.g
            style={svgOrigin}
            animate={{ rotate: [-3, 3, -3] }}
            transition={{
                duration: sway,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay + 0.8,
            }}
        >
            <motion.g
                style={svgOrigin}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay, duration: 0.7, ease: "easeOut" }}
            >
                <path
                    d="M0 0 L0 -34"
                    stroke="#2f7a4d"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                />
                <path
                    d="M0 -20 C -14 -22 -22 -32 -22 -44 C -10 -42 0 -34 0 -20Z"
                    fill="#4c9a62"
                />
                <path
                    d="M0 -26 C 14 -28 22 -38 22 -50 C 10 -48 0 -40 0 -26Z"
                    fill="#3f8a55"
                />
            </motion.g>
        </motion.g>
    );
}

function FieldScene() {
    const rows = [
        { y: 316, scale: 0.7 },
        { y: 346, scale: 0.85 },
        { y: 380, scale: 1 },
    ];

    return (
        <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 480 400"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            {/* Sun */}
            <motion.circle
                cx="372"
                cy="86"
                r="58"
                fill="#f2c14e"
                opacity="0.28"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                animate={{ scale: [1, 1.14, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
                cx="372"
                cy="86"
                r="36"
                fill="#f2c14e"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
            />

            {/* Clouds */}
            <motion.g
                animate={{ x: [0, 28, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            >
                <ellipse cx="96" cy="74" rx="36" ry="12" fill="#fff" opacity="0.85" />
                <ellipse cx="122" cy="64" rx="22" ry="12" fill="#fff" opacity="0.85" />
            </motion.g>

            {/* Land */}
            <path
                d="M0 230 C 90 190 200 215 300 195 C 380 180 440 200 480 190 L480 400 L0 400 Z"
                fill="#cfe3c4"
            />
            <path
                d="M0 270 C 110 235 230 265 340 240 C 410 224 450 240 480 236 L480 400 L0 400 Z"
                fill="#a9d0a0"
            />
            <path
                d="M0 300 C 120 280 260 305 480 280 L480 400 L0 400 Z"
                fill="#86b985"
            />

            {/* Crops */}
            {rows.map((row, r) =>
                Array.from({ length: 6 }, (_, i) => {
                    const x = 36 + i * 82 + (r % 2) * 41;
                    return (
                        <g
                            key={`${r}-${i}`}
                            transform={`translate(${x} ${row.y}) scale(${row.scale})`}
                        >
                            <Crop delay={0.5 + r * 0.25 + i * 0.06} sway={3.4 + (i % 3) * 0.5} />
                        </g>
                    );
                })
            )}
        </svg>
    );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function HomeClient({ copy }: { copy: HomeCopy }) {
    const reduced = useReducedMotion();
    const [active, setActive] = useState(0);
    const [playing, setPlaying] = useState(true);
    const [engaged, setEngaged] = useState(false);
    const [acres, setAcres] = useState(5);

    const autoplay = playing && !engaged && !reduced;
    const stepCount = copy.how.steps.length;

    // Advance the steps automatically, but never while the person is
    // hovering, focused inside, or has pressed pause.
    useEffect(() => {
        if (!autoplay) return;
        const id = setTimeout(
            () => setActive((a) => (a + 1) % stepCount),
            STEP_DURATION_MS
        );
        return () => clearTimeout(id);
    }, [autoplay, active, stepCount]);

    return (
        <MotionConfig reducedMotion="user">
            <div className="overflow-x-clip bg-gradient-to-br from-[#f3faf5] via-white to-[#eef8f0] text-slate-900">
                {/* ------------------------------ Hero ----------------------------- */}
                <section className="pb-16 pt-10 lg:pb-24 lg:pt-20">
                    <div
                        className={`${container} grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14`}
                    >
                        <div>
                            <motion.h1
                                className="text-4xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
                                variants={rise}
                                custom={0}
                                initial="hidden"
                                animate="show"
                            >
                                {copy.title}
                            </motion.h1>

                            <motion.p
                                className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg"
                                variants={rise}
                                custom={1}
                                initial="hidden"
                                animate="show"
                            >
                                {copy.subtitle}
                            </motion.p>

                            <motion.div
                                className="mt-7 flex flex-col gap-3 sm:flex-row"
                                variants={rise}
                                custom={2}
                                initial="hidden"
                                animate="show"
                            >
                                <Link href={CROP_FINDER_HREF} className={btnPrimary}>
                                    {copy.cta}
                                    <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link href="/contact" className={btnGhost}>
                                    <MessageCircle className="h-[18px] w-[18px]" />
                                    {copy.ctaSecondary}
                                </Link>
                            </motion.div>

                            <motion.ul
                                className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5 text-sm font-semibold text-slate-600"
                                variants={rise}
                                custom={3}
                                initial="hidden"
                                animate="show"
                            >
                                {copy.points.map((point) => (
                                    <li key={point} className="flex items-center gap-2">
                                        <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white">
                                            <Check className="h-3 w-3" strokeWidth={3} />
                                        </span>
                                        {point}
                                    </li>
                                ))}
                            </motion.ul>
                        </div>

                        <motion.div
                            className="relative aspect-[6/5] overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-gradient-to-b from-amber-100 to-emerald-50 shadow-[0_24px_60px_rgba(20,60,40,0.14)]"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <FieldScene />

                            <motion.div
                                className="absolute left-[6%] top-[8%] flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-lg sm:px-3.5 sm:py-2 sm:text-sm"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: [0, -7, 0] }}
                                transition={{
                                    opacity: { delay: 1.2, duration: 0.4 },
                                    y: { delay: 1.2, duration: 5, repeat: Infinity, ease: "easeInOut" },
                                }}
                            >
                                <MapPin className="h-4 w-4" />
                                {copy.chips.location}
                            </motion.div>

                            <motion.div
                                className="absolute bottom-[12%] right-[6%] flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-lg sm:px-3.5 sm:py-2 sm:text-sm"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: [0, -7, 0] }}
                                transition={{
                                    opacity: { delay: 1.5, duration: 0.4 },
                                    y: { delay: 1.5, duration: 6, repeat: Infinity, ease: "easeInOut" },
                                }}
                            >
                                <Ruler className="h-4 w-4" />
                                {copy.chips.size}
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* ---------------------------- Services --------------------------- */}
                <section className="py-14 lg:py-20">
                    <div className={container}>
                        <motion.div className="mb-8 max-w-2xl" variants={rise} {...inView}>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                {copy.services.title}
                            </h2>
                            <p className="mt-3 leading-7 text-slate-600">
                                {copy.services.subtitle}
                            </p>
                        </motion.div>

                        {/* Featured: crop finder */}
                        <motion.div
                            className="relative mb-5 grid gap-6 overflow-hidden rounded-3xl bg-emerald-700 p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 92% 0%, rgba(242,193,78,0.28), transparent 45%)",
                            }}
                            variants={rise}
                            {...inView}
                        >
                            <div>
                                <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-white">
                                    <TrendingUp className="h-6 w-6" />
                                </span>
                                <h3 className="text-2xl font-extrabold !text-white">
                                    {copy.services.featured.title}
                                </h3>
                                <p className="mt-2.5 max-w-xl leading-7 !text-emerald-100">
                                    {copy.services.featured.body}
                                </p>
                            </div>
                            <Link href={CROP_FINDER_HREF} className={btnLight}>
                                {copy.services.featured.cta}
                                <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
                            </Link>
                        </motion.div>

                        {/* Other services */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {copy.services.items.map((item, i) => {
                                const { icon: Icon, href } = serviceMeta[item.id];
                                return (
                                    <motion.div
                                        key={item.id}
                                        className="flex"
                                        variants={rise}
                                        custom={i}
                                        {...inView}
                                    >
                                        <Link
                                            href={href}
                                            className="group flex flex-1 flex-col rounded-[1.25rem] border border-emerald-100 bg-white p-6 !no-underline outline-none transition duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-[0_16px_36px_rgba(16,185,129,0.14)] focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                                        >
                                            <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                                <Icon className="h-[22px] w-[22px]" />
                                            </span>
                                            <h3 className="text-lg font-extrabold text-slate-900">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                                                {item.body}
                                            </p>
                                            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                                                {item.cta}
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ---------------------------- How it works ----------------------- */}
                <section className="bg-emerald-50/80 py-16 lg:py-20">
                    <div className={container}>
                        <motion.div className="mb-8 max-w-2xl" variants={rise} {...inView}>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                {copy.how.title}
                            </h2>
                            <p className="mt-3 leading-7 text-slate-600">{copy.how.subtitle}</p>
                        </motion.div>

                        <div
                            className="grid gap-7 lg:grid-cols-2 lg:items-start lg:gap-12"
                            onMouseEnter={() => setEngaged(true)}
                            onMouseLeave={() => setEngaged(false)}
                            onFocusCapture={() => setEngaged(true)}
                            onBlurCapture={() => setEngaged(false)}
                        >
                            <div>
                                <ol className="grid gap-3">
                                    {copy.how.steps.map((step, i) => {
                                        const on = i === active;
                                        return (
                                            <li key={step.title}>
                                                <button
                                                    type="button"
                                                    onClick={() => setActive(i)}
                                                    aria-current={on ? "step" : undefined}
                                                    className={`relative flex w-full gap-4 overflow-hidden rounded-2xl border-2 px-5 py-4 text-left outline-none transition-colors focus-visible:ring-4 focus-visible:ring-emerald-500/30 ${on
                                                            ? "border-emerald-600 bg-white"
                                                            : "border-transparent hover:bg-white/60"
                                                        }`}
                                                >
                                                    <span
                                                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-extrabold transition-colors ${on
                                                                ? "bg-emerald-600 text-white"
                                                                : "bg-emerald-100 text-emerald-700"
                                                            }`}
                                                    >
                                                        {i + 1}
                                                    </span>

                                                    <span className="block min-w-0">
                                                        <span className="block pt-1.5 text-base font-bold leading-snug text-slate-900">
                                                            {step.title}
                                                        </span>
                                                        <AnimatePresence initial={false}>
                                                            {on && (
                                                                <motion.span
                                                                    className="mt-1.5 block overflow-hidden text-sm leading-6 text-slate-600"
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.25 }}
                                                                >
                                                                    {step.body}
                                                                </motion.span>
                                                            )}
                                                        </AnimatePresence>
                                                    </span>

                                                    {on && autoplay && (
                                                        <motion.span
                                                            key={`bar-${active}`}
                                                            className="absolute bottom-0 left-0 h-[3px] bg-emerald-500"
                                                            initial={{ width: "0%" }}
                                                            animate={{ width: "100%" }}
                                                            transition={{
                                                                duration: STEP_DURATION_MS / 1000,
                                                                ease: "linear",
                                                            }}
                                                        />
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ol>

                                {!reduced && (
                                    <button
                                        type="button"
                                        onClick={() => setPlaying((p) => !p)}
                                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3.5 py-2 text-xs font-semibold text-slate-600 outline-none transition hover:bg-white hover:text-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                                    >
                                        {playing ? (
                                            <Pause className="h-3.5 w-3.5" />
                                        ) : (
                                            <Play className="h-3.5 w-3.5" />
                                        )}
                                        {playing ? copy.how.pause : copy.how.play}
                                    </button>
                                )}
                            </div>

                            {/* Preview panel */}
                            <div
                                className="flex min-h-[300px] flex-col justify-center rounded-3xl border border-emerald-100 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] sm:p-7"
                                aria-live="polite"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={active}
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {active === 0 && (
                                            <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-600 bg-white px-4 py-4 text-slate-500">
                                                <MapPin className="h-5 w-5 text-emerald-600" />
                                                <span>{copy.how.placeholder}</span>
                                                <span
                                                    className="h-5 w-0.5 animate-pulse bg-emerald-600 motion-reduce:animate-none"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                        )}

                                        {active === 1 && (
                                            <div>
                                                <div className="flex items-baseline justify-between font-bold text-slate-700">
                                                    <label htmlFor="home-acres">{copy.how.sizeLabel}</label>
                                                    <output
                                                        htmlFor="home-acres"
                                                        className="text-3xl font-black text-emerald-700"
                                                    >
                                                        {acres} {copy.how.unit}
                                                    </output>
                                                </div>
                                                <input
                                                    id="home-acres"
                                                    type="range"
                                                    min={1}
                                                    max={MAX_ACRES}
                                                    value={acres}
                                                    onChange={(e) => setAcres(Number(e.target.value))}
                                                    className="my-4 h-7 w-full accent-emerald-600"
                                                />
                                                <div className="h-[90px] overflow-hidden rounded-xl border border-dashed border-amber-300 bg-amber-100/70">
                                                    <motion.div
                                                        className="h-full rounded-lg"
                                                        style={{
                                                            backgroundImage:
                                                                "repeating-linear-gradient(90deg, #6fae7a 0 10px, #5a9a67 10px 20px)",
                                                        }}
                                                        animate={{ width: `${(acres / MAX_ACRES) * 100}%` }}
                                                        transition={{ type: "spring", stiffness: 220, damping: 26 }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {active === 2 && (
                                            <div>
                                                <div className="grid gap-4">
                                                    {copy.how.ranks.map((label, i) => (
                                                        <div key={label} className="grid gap-1.5">
                                                            <span className="text-sm font-bold text-slate-700">
                                                                {label}
                                                            </span>
                                                            <div className="h-3.5 overflow-hidden rounded-full bg-slate-100">
                                                                <motion.div
                                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-700"
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${[92, 74, 58][i] ?? 50}%` }}
                                                                    transition={{
                                                                        delay: 0.15 * i,
                                                                        duration: 0.7,
                                                                        ease: "easeOut",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="mt-5 text-sm leading-6 text-slate-500">
                                                    {copy.how.note}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ------------------------------ Final CTA ------------------------ */}
                <section className="py-14 lg:py-20">
                    <div className={container}>
                        <motion.div
                            className="rounded-[1.75rem] bg-emerald-900 px-6 py-11 text-center sm:px-10 sm:py-16"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 15% 0%, rgba(242,193,78,0.22), transparent 40%)",
                            }}
                            variants={rise}
                            {...inView}
                        >
                            <h2 className="mx-auto max-w-2xl text-3xl font-black leading-tight !text-white sm:text-4xl">
                                {copy.final.title}
                            </h2>
                            <p className="mx-auto mb-7 mt-3 max-w-md leading-7 !text-emerald-100">
                                {copy.final.body}
                            </p>
                            <Link href={CROP_FINDER_HREF} className={`${btnLight} sm:mx-auto`}>
                                {copy.cta}
                                <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    </div>
                </section>
            </div>
        </MotionConfig>
    );
}