import { BookOpen, Lightbulb, Sparkles } from "lucide-react";

const subjects = [
  { label: "Mathematics", mark: "¼ + ¾", color: "bg-[#f5c65e] text-[#55431d]" },
  { label: "Science", mark: "✳", color: "bg-[#9bc8a0] text-[#315844]" },
  { label: "Reading", mark: "Aa", color: "bg-[#e9a88f] text-[#754a3c]" },
];

export function LearningArtwork() {
  return (
    <div
      role="img"
      aria-label="Illustration of colourful learning materials for mathematics, science, and reading"
      className="relative mx-auto aspect-[1.13] w-full max-w-[680px] overflow-hidden rounded-[34px] bg-[#e8dfcb] p-4 sm:p-7"
    >
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#9d9278 0.7px, transparent 0.7px)", backgroundSize: "13px 13px" }} />
      <div className="absolute -left-20 -top-20 size-64 rounded-full border border-[#fff9e9]/70" />
      <div className="absolute -left-10 -top-10 size-44 rounded-full border border-[#fff9e9]/70" />

      <div className="absolute left-[8%] top-[12%] flex size-[74%] rotate-[-3deg] flex-col rounded-[27px] bg-[#294b43] p-5 shadow-[0_35px_45px_-30px_rgba(37,54,49,.7)] sm:p-8">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-[#e7d49e]/45 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[.18em] text-[#e7d49e]">
            Curiosity at work
          </span>
          <Sparkles className="size-5 text-[#f3c45d]" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="font-display text-[clamp(2rem,6vw,4.7rem)] font-extrabold leading-none tracking-[-.08em] text-[#fff4d5]">
            What if
          </p>
          <p className="mt-1 font-display text-[clamp(2rem,6vw,4.7rem)] font-extrabold leading-none tracking-[-.08em] text-[#f3c45d]">
            you could?
          </p>
          <div className="mt-6 flex items-center gap-2 text-[#d3dfcb]">
            <span className="h-px w-8 bg-[#aebda7]/70" />
            <span className="text-[9px] font-bold uppercase tracking-[.18em]">Ask · Explore · Understand</span>
            <span className="h-px w-8 bg-[#aebda7]/70" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <BookOpen className="size-7 text-[#b8cdb5]" />
          <span className="font-display text-[9px] font-bold uppercase tracking-[.15em] text-[#b8cdb5]">Room for every question</span>
        </div>
      </div>

      <div className="absolute bottom-[9%] right-[4%] w-[39%] rotate-[4deg] rounded-[20px] border border-[#e8dfcd] bg-[#fffdf7] p-3 shadow-[0_18px_30px_-20px_rgba(50,53,60,.55)] sm:p-4">
        <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[.15em] text-[#9c9688]">A world of ideas</p>
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div key={subject.label} className="flex items-center gap-2.5">
              <span className={`flex size-8 items-center justify-center rounded-xl text-[12px] font-extrabold ${subject.color}`}>
                {subject.mark}
              </span>
              <span className="text-[10px] font-bold text-[#535d73]">{subject.label}</span>
              <span className="ml-auto size-1.5 rounded-full bg-[#9dbb9c]" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-[9%] top-[9%] flex size-12 rotate-[11deg] items-center justify-center rounded-[17px] bg-[#f3c45d] text-[#31415a] shadow-lg sm:size-14">
        <Lightbulb className="size-6 sm:size-7" />
      </div>
    </div>
  );
}
