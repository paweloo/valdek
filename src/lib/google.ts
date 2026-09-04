import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SaveSchema = z.object({
  url: z.string().min(8).max(500),
  mapping: z.object({
    fullName: z.number().optional(),
    firstName: z.number().optional(),
    lastName: z.number().optional(),
    group: z.number().optional(),
    fee: z.number().optional(),
    nameOrder: z.enum(["first-last", "last-first"]).optional(),
    months: z.record(z.string(), z.number()),
    groupFlags: z.array(z.object({ column: z.number(), name: z.string() })).optional(),
  }),
  people: z
    .array(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        fee: z.number(),
        groupName: z.string(),
        monthsPaid: z.record(z.string(), z.boolean()),
      }),
    )
    .max(500),
});

export const getGoogleStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { googleIsConfigured, googleIsConnected, publicOrigin, googleCallbackUrl } = await import("./google.server");
  const origin = publicOrigin();
  return {
    configured: googleIsConfigured(),
    connected: googleIsConnected(),
    redirectUri: origin ? googleCallbackUrl(origin) : "",
  };
});

export const saveGoogleSheet = createServerFn({ method: "POST" })
  .validator((data) => SaveSchema.parse(data))
  .handler(async ({ data }) => {
    const { writeGoogleSheet } = await import("./google.server");
    return writeGoogleSheet(data);
  });

export const disconnectGoogle = createServerFn({ method: "POST" }).handler(async () => {
  const { disconnectGoogle: clear } = await import("./google.server");
  clear();
  return { ok: true as const };
});
