import { createFileRoute } from "@tanstack/react-router";
import { cookieHeader } from "@/lib/google-cookies";

export const Route = createFileRoute("/api/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { exchangeGoogleCode, readOAuthState } = await import("@/lib/google.server");
        const url = new URL(request.url);
        const origin = url.origin;
        const secure = origin.startsWith("https://");
        const error = url.searchParams.get("error");
        const code = url.searchParams.get("code") ?? "";
        const state = url.searchParams.get("state") ?? "";
        const expected = readOAuthState();
        const fail = () => Response.redirect(`${origin}/uczestnicy?google=denied`, 302);
        if (error || !code || !state || !expected || state !== expected) return fail();
        const result = await exchangeGoogleCode(origin, code);
        if (!result.ok) return fail();
        const headers = new Headers();
        headers.set("Location", `${origin}/uczestnicy?google=ok`);
        headers.append("Set-Cookie", cookieHeader("valdek_g_at", result.accessToken, Math.max(60, result.expiresIn - 60), secure));
        if (result.refreshToken) {
          headers.append("Set-Cookie", cookieHeader("valdek_g_rt", result.refreshToken, 60 * 60 * 24 * 30, secure));
        }
        headers.append("Set-Cookie", cookieHeader("valdek_g_state", "", 0, secure));
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
