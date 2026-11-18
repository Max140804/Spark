import "dotenv/config";
import { z } from "zod";

const productionEnvironment = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://")),
  NEXTAUTH_URL: z.string().url().refine((value) => value.startsWith("https://")),
  NEXTAUTH_SECRET: z.string().min(32),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().email().or(z.string().regex(/^.+<[^<>@\s]+@[^<>@\s]+>$/)),
  LIVEKIT_URL: z.string().url().refine((value) => value.startsWith("wss://")),
  LIVEKIT_API_KEY: z.string().min(1),
  LIVEKIT_API_SECRET: z.string().min(1),
});

const result = productionEnvironment.safeParse(process.env);
if (!result.success) {
  console.error("Production configuration is incomplete or invalid:");
  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exitCode = 1;
} else {
  console.log("Required production environment variables are present.");
}
