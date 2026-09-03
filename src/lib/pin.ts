import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PinSchema = z.object({
  pin: z.string().regex(/^\d{6}$/),
});

export const getPinGate = createServerFn({ method: "GET" }).handler(async () => {
  const { readPinGate } = await import("./pin.server");
  return readPinGate();
});

export const submitPin = createServerFn({ method: "POST" })
  .validator((data) => PinSchema.parse(data))
  .handler(async ({ data }) => {
    const { verifyAndUnlock } = await import("./pin.server");
    return verifyAndUnlock(data.pin);
  });
