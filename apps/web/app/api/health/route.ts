import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export function GET() {
  return checkReadiness();
}

async function checkReadiness() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Readiness check failed:", error);
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}