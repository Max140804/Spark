"use client";

import { motion } from "framer-motion";
import { Lock, Play, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type PathNode = {
  id: string;
  title: string;
  status: "locked" | "available" | "live" | "done";
  type: "lesson" | "assignment" | "quiz";
};

export function SparkPath({ nodes }: { nodes: PathNode[] }) {
  return (
    <div className="relative mx-auto max-w-md">
      <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-spark-amber-200 via-spark-amber-100 to-transparent" />
      <ul className="relative space-y-6">
        {nodes.map((node, i) => (
          <li
            key={node.id}
            className={cn(
              "relative flex items-center",
              i % 2 === 0 ? "justify-start" : "justify-end"
            )}
          >
            <NodeCard node={node} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NodeCard({ node }: { node: PathNode }) {
  const isLive = node.status === "live";
  const isDone = node.status === "done";
  const isLocked = node.status === "locked";

  const Icon = isDone ? CheckCircle2 : isLive ? Play : isLocked ? Lock : Sparkles;

  return (
    <motion.button
      whileHover={!isLocked ? { scale: 1.03 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      disabled={isLocked}
      className={cn(
        "relative flex w-64 items-center gap-3 rounded-3xl border-2 bg-white p-4 text-left shadow-card transition-colors",
        isLive && "border-spark-amber-400 animate-spark-pulse spark-glow",
        isDone && "border-emerald-300 bg-emerald-50",
        isLocked && "border-spark-indigo-100 opacity-60",
        !isLive && !isDone && !isLocked && "border-spark-indigo-200"
      )}
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl",
          isLive
            ? "bg-spark-amber-400 text-spark-indigo-900"
            : isDone
            ? "bg-emerald-200 text-emerald-800"
            : "bg-spark-indigo-100 text-spark-indigo-700"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold text-spark-indigo-900">
          {node.title}
        </p>
        <p className="text-xs capitalize text-spark-indigo-600">
          {node.type}
          {isLive && " · Live now"}
        </p>
      </div>
    </motion.button>
  );
}