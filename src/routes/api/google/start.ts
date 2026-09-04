import { createFileRoute } from "@tanstack/react-router";
import { cookieHeader } from "@/lib/google-cookies";

export const Route = createFileRoute("/api/google/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { readPinGate } = await import("@/lib/pin.server");
        const { googleAuthUrl, googleIsConfigured, newOAuthState, publicOrigin } = await import("@/lib/google.server");
        const origin = publicOrigin(request);
        const secure = origin.startsWith("https://");
        const gate = readPinGate();
        if (gate.required && !gate.unlocked) {
          return Response.redirect(`${origin}/`, 302);
        }
        if (!googleIsConfigured()) {
          return Response.redirect(`${origin}/uczestnicy?google=setup`, 302);
        }
        const state = newOAuthState();
        const url = googleAuthUrl(origin, state);
        if (!url) return Response.redirect(`${origin}/uczestnicy?google=setup`, 302);
        const headers = new Headers();
        headers.set("Location", url);
        headers.append("Set-Cookie", cookieHeader("valdek_g_state", state, 600, secure));
        headers.append("Set-Cookie", cookieHeader("valdek_g_origin", origin, 600, secure));
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
