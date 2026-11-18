import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import { LearningArtwork } from "@/components/classroom/learning-artwork";

const highlights = [
  { icon: Users, label: "Small, friendly classes" },
  { icon: BookOpen, label: "Made for curious minds" },
  { icon: GraduationCap, label: "Teachers you can trust" },
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-[#fbf8f1] text-[#202b4a]">
      <nav className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-14">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="SPARK home">
          <span className="flex size-10 items-center justify-center rounded-[15px] bg-[#ffbf4a] text-[#172343] shadow-[0_6px_18px_-8px_rgba(174,112,20,.7)] transition-transform group-hover:rotate-[-8deg]">
            <Sparkles className="size-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[21px] font-extrabold tracking-[-0.06em]">
            SPARK<span className="text-[#e7a537]">.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 text-[13px] font-semibold text-[#747b8b] md:flex">
          <a className="transition-colors hover:text-[#202b4a]" href="#learning">The SPARK approach</a>
          <a className="transition-colors hover:text-[#202b4a]" href="#how-it-works">Who it&apos;s for</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="rounded-full px-3 py-2.5 text-[13px] font-bold text-[#454e66] transition-colors hover:text-[#d18413] sm:px-4"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-[#202b4a] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-12px_rgba(32,43,74,.8)] transition-all hover:-translate-y-0.5 hover:bg-[#303e64] sm:px-5"
          >
            Join a class
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-20 pt-9 sm:px-8 md:pt-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-8 lg:px-14 lg:pb-24 lg:pt-10">
        <div className="relative z-[1] mx-auto max-w-[560px] lg:mx-0">
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#e9dfc9] bg-white/80 px-3.5 py-2 shadow-[0_4px_18px_-14px_rgba(61,62,70,.5)]">
            <Sparkles className="size-4 text-[#bc8d37]" />
            <span className="text-[11px] font-extrabold uppercase tracking-[.13em] text-[#4c6858]">
              Thoughtful learning, built for real life
            </span>
          </div>

          <h1 className="font-display text-[clamp(3.35rem,6.6vw,6.25rem)] font-extrabold leading-[.99] tracking-[-.075em] text-[#202b4a]">
            Big ideas.
            <br />
            <span className="relative inline-block text-[#e2a032]">
              Bright
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 202 14"
                fill="none"
                aria-hidden="true"
              >
                <path d="M3 9C48 2 147 1 199 8" stroke="#f3c76e" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>{" "}
            minds.
          </h1>

          <p className="mt-7 max-w-[440px] text-[16px] leading-7 text-[#70788a] sm:text-[17px]">
            A calmer, more connected way for children to learn — with trusted
            teachers, clear lesson pathways, and parents in the picture.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/register?role=parent"
              className="group inline-flex h-[52px] items-center gap-3 rounded-full bg-[#f4b740] px-6 text-[14px] font-extrabold text-[#26304b] shadow-[0_10px_22px_-12px_rgba(190,130,30,.8)] transition-all hover:-translate-y-0.5 hover:bg-[#ffc75b]"
            >
              Find your seat
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="#classroom"
              className="inline-flex h-[52px] items-center gap-2 rounded-full px-4 text-[13px] font-bold text-[#59637a] transition-colors hover:text-[#d18413]"
            >
              Explore the approach
              <ArrowDown className="size-4" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#e9e3d8] pt-6">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[11px] font-semibold text-[#777d8a]">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#e7f0e5] text-[#5b8c68]">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <Icon className="hidden size-3.5 text-[#b28b4b] sm:block" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div id="learning" className="relative mx-auto w-full max-w-[760px] scroll-mt-8 lg:ml-auto">
          <LearningArtwork />
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[#ece5d9] bg-[#f6f1e7]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-center lg:px-14">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="mr-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#aaa18e]">A little different</span>
            <span className="rounded-full border border-[#e8ddc8] bg-[#fbf8f1] px-3 py-1.5 text-[11px] font-bold text-[#697188]">✦ &nbsp;Small groups, big participation</span>
            <span className="rounded-full border border-[#e8ddc8] bg-[#fbf8f1] px-3 py-1.5 text-[11px] font-bold text-[#697188]">✦ &nbsp;Nigeria’s curriculum, made joyful</span>
            <span className="rounded-full border border-[#e8ddc8] bg-[#fbf8f1] px-3 py-1.5 text-[11px] font-bold text-[#697188]">✦ &nbsp;Parent-first learner safety</span>
          </div>
          <p className="text-[12px] font-medium text-[#959080]">
            Primary &amp; JSS <span className="px-1.5 text-[#d3b980]">/</span> Made for the way kids learn
          </p>
        </div>
      </section>
    </main>
  );
}
