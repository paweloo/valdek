import { createHmac, timingSafeEqual } from "node:crypto";
import { getCookie, setCookie } from "@tanstack/react-start/server";

const COOKIE = "valdek_gate";
const PIN_RE = /^\d{6}$/;

function configuredPin() {
  const raw = String(process.env["VALDEK_PIN"] ?? "").trim();
  if (PIN_RE.test(raw)) return raw;
  if (import.meta.env.DEV) return "246810";
  return null;
}

function tokenFor(pin: string) {
  return createHmac("sha256", pin).update("valdek-unlocked").digest("hex");
}

function tokensEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function readPinGate() {
  const pin = configuredPin();
  if (!pin) {
    return { required: false, unlocked: true, configured: false };
  }
  const cookie = getCookie(COOKIE);
  const unlocked = Boolean(cookie && tokensEqual(cookie, tokenFor(pin)));
  return { required: true, unlocked, configured: true };
}

export function verifyAndUnlock(pin: string) {
  const expected = configuredPin();
  if (!expected || !PIN_RE.test(pin) || !tokensEqual(pin, expected)) {
    return { ok: false as const };
  }
  setCookie(COOKIE, tokenFor(expected), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: !import.meta.env.DEV,
  });
  return { ok: true as const };
}
