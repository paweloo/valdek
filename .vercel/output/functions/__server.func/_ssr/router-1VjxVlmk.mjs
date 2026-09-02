import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as createRootRoute, b as useRouter, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { n as Portal, r as Provider, t as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { n as utils, t as readSync } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-1VjxVlmk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatPln(value) {
	return new Intl.NumberFormat("pl-PL", {
		style: "currency",
		currency: "PLN",
		maximumFractionDigits: 2
	}).format(value);
}
function uid(prefix = "id") {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
	return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
var TooltipProvider = Provider;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-[var(--shadow-elevated)]", className),
	...props
}) }));
TooltipContent.displayName = Content2.displayName;
function Toaster$1() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme: "dark",
		position: "bottom-right",
		toastOptions: { classNames: { toast: "bg-popover text-popover-foreground border-border shadow-[var(--shadow-elevated)]" } }
	});
}
var PL_MONTHS = [
	"styczeń",
	"luty",
	"marzec",
	"kwiecień",
	"maj",
	"czerwiec",
	"lipiec",
	"sierpień",
	"wrzesień",
	"październik",
	"listopad",
	"grudzień"
];
var MONTH_ALIASES = [
	{
		month: 1,
		names: [
			"styczen",
			"stycznia",
			"sty"
		]
	},
	{
		month: 2,
		names: [
			"luty",
			"lutego",
			"lut"
		]
	},
	{
		month: 3,
		names: [
			"marzec",
			"marca",
			"mar"
		]
	},
	{
		month: 4,
		names: [
			"kwiecien",
			"kwietnia",
			"kwi"
		]
	},
	{
		month: 5,
		names: ["maj", "maja"]
	},
	{
		month: 6,
		names: [
			"czerwiec",
			"czerwca",
			"cze"
		]
	},
	{
		month: 7,
		names: [
			"lipiec",
			"lipca",
			"lip"
		]
	},
	{
		month: 8,
		names: [
			"sierpien",
			"sierpnia",
			"sie"
		]
	},
	{
		month: 9,
		names: [
			"wrzesien",
			"wrzesnia",
			"wrz"
		]
	},
	{
		month: 10,
		names: [
			"pazdziernik",
			"pazdziernika",
			"paz",
			"pazdz"
		]
	},
	{
		month: 11,
		names: [
			"listopad",
			"listopada",
			"lis"
		]
	},
	{
		month: 12,
		names: [
			"grudzien",
			"grudnia",
			"gru"
		]
	}
];
var ROMAN = [
	{
		month: 12,
		token: "xii"
	},
	{
		month: 11,
		token: "xi"
	},
	{
		month: 10,
		token: "x"
	},
	{
		month: 9,
		token: "ix"
	},
	{
		month: 8,
		token: "viii"
	},
	{
		month: 7,
		token: "vii"
	},
	{
		month: 6,
		token: "vi"
	},
	{
		month: 4,
		token: "iv"
	},
	{
		month: 3,
		token: "iii"
	},
	{
		month: 2,
		token: "ii"
	}
];
var PL_FIRST_NAMES = /* @__PURE__ */ new Set([
	"adam",
	"agnieszka",
	"aleksander",
	"aleksandra",
	"alicja",
	"aneta",
	"ania",
	"anna",
	"antoni",
	"barbara",
	"bartosz",
	"beata",
	"bogdan",
	"bozena",
	"damian",
	"daniel",
	"danuta",
	"dariusz",
	"dawid",
	"dominik",
	"dorota",
	"elzbieta",
	"emilia",
	"ewa",
	"filip",
	"franciszek",
	"grazyna",
	"grzegorz",
	"halina",
	"hanna",
	"helena",
	"ignacy",
	"igor",
	"irena",
	"iwona",
	"jadwiga",
	"jakub",
	"jan",
	"janusz",
	"jaroslaw",
	"jerzy",
	"joanna",
	"jacek",
	"julia",
	"justyna",
	"kacper",
	"kamil",
	"karol",
	"karolina",
	"katarzyna",
	"kazimierz",
	"kinga",
	"konrad",
	"krystyna",
	"krzysztof",
	"lena",
	"leszek",
	"lidia",
	"lucja",
	"lukasz",
	"magdalena",
	"maja",
	"malgorzata",
	"marek",
	"maria",
	"marta",
	"martyna",
	"marcin",
	"mariusz",
	"mateusz",
	"michal",
	"mikolaj",
	"monika",
	"natalia",
	"natalia",
	"nikola",
	"oliwia",
	"oliwier",
	"olga",
	"patrycja",
	"patryk",
	"paulina",
	"pawel",
	"piotr",
	"pola",
	"rafal",
	"renata",
	"robert",
	"roma",
	"ryszard",
	"sebastian",
	"stanislaw",
	"stefan",
	"sylwia",
	"szymon",
	"tadeusz",
	"teresa",
	"tomasz",
	"urszula",
	"weronika",
	"wiktor",
	"wiktoria",
	"wojciech",
	"zbigniew",
	"zenon",
	"zofia",
	"zosia",
	"zygmunt"
]);
function stripDiacritics(input) {
	return input.replace(/ł/g, "l").replace(/Ł/g, "L").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function normalizeText(input) {
	return stripDiacritics(input).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
function monthLabel(monthKey) {
	const [year, month] = monthKey.split("-");
	return `${PL_MONTHS[Number(month) - 1] ?? monthKey} ${year}`;
}
function monthShort(monthKey) {
	return (PL_MONTHS[Number(monthKey.slice(5, 7)) - 1] ?? monthKey).slice(0, 3);
}
function seasonMonths(startYear) {
	const keys = [];
	for (let m = 9; m <= 12; m += 1) keys.push(`${startYear}-${String(m).padStart(2, "0")}`);
	for (let m = 1; m <= 6; m += 1) keys.push(`${startYear + 1}-${String(m).padStart(2, "0")}`);
	return keys;
}
function currentSeasonStartYear(now = /* @__PURE__ */ new Date()) {
	const year = now.getFullYear();
	return now.getMonth() + 1 >= 9 ? year : year - 1;
}
function currentMonthKey(now = /* @__PURE__ */ new Date()) {
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
function monthKeyFor(month, seasonYear) {
	return `${month >= 9 ? seasonYear : seasonYear + 1}-${String(month).padStart(2, "0")}`;
}
function detectMonthsInText(text, fallbackYear) {
	const norm = ` ${normalizeText(text)} `;
	const found = /* @__PURE__ */ new Set();
	for (const entry of MONTH_ALIASES) for (const name of entry.names) if (norm.includes(` ${name} `)) found.add(monthKeyFor(entry.month, fallbackYear));
	for (const { month, token } of ROMAN) if (new RegExp(`(?:^|\\s)za\\s${token}(?:\\s|$)`).test(norm.trim())) found.add(monthKeyFor(month, fallbackYear));
	const dotted = text.match(/\b(0?[1-9]|1[0-2])[./](20\d{2})\b/g) ?? [];
	for (const token of dotted) {
		const [m, y] = token.split(/[./]/);
		found.add(`${y}-${m.padStart(2, "0")}`);
	}
	const iso = text.match(/\b(20\d{2})-(0[1-9]|1[0-2])\b/g) ?? [];
	for (const token of iso) found.add(token);
	return [...found];
}
function parsePln(raw) {
	const cleaned = raw.replace(/\s/g, "").replace(/zł|pln/gi, "").replace(/\./g, "").replace(",", ".");
	const n = Number(cleaned);
	return Number.isFinite(n) ? n : null;
}
function parseLooseDate(raw) {
	const iso = raw.match(/(20\d{2})-(\d{2})-(\d{2})/);
	if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
	const dmy = raw.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
	if (!dmy) return null;
	const day = dmy[1].padStart(2, "0");
	const month = dmy[2].padStart(2, "0");
	let year = dmy[3];
	if (year.length === 2) year = `20${year}`;
	return `${year}-${month}-${day}`;
}
function fullName(first, last) {
	return `${first} ${last}`.trim();
}
function splitFullName(name, order = "first-last") {
	const parts = name.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
	if (parts.length === 0) return {
		firstName: "",
		lastName: ""
	};
	if (parts.length === 1) return {
		firstName: parts[0],
		lastName: ""
	};
	if (order === "last-first") return {
		lastName: parts[0],
		firstName: parts.slice(1).join(" ")
	};
	return {
		firstName: parts.slice(0, -1).join(" "),
		lastName: parts.at(-1) ?? ""
	};
}
function guessNameOrder(names) {
	const parsed = names.map((n) => n.trim().split(/\s+/).filter(Boolean)).filter((p) => p.length >= 2);
	if (parsed.length === 0) return "last-first";
	const firstTokens = parsed.map((p) => normalizeText(p[0]));
	const lastTokens = parsed.map((p) => normalizeText(p[p.length - 1]));
	const firstDupes = firstTokens.length - new Set(firstTokens).size;
	const lastDupes = lastTokens.length - new Set(lastTokens).size;
	if (firstDupes > lastDupes) return "last-first";
	if (lastDupes > firstDupes) return "first-last";
	let lastFirstVotes = 0;
	let firstLastVotes = 0;
	for (const parts of parsed) {
		const a = normalizeText(parts[0]);
		const b = normalizeText(parts[parts.length - 1]);
		const aFirst = PL_FIRST_NAMES.has(a);
		const bFirst = PL_FIRST_NAMES.has(b);
		if (bFirst && !aFirst) lastFirstVotes += 1;
		if (aFirst && !bFirst) firstLastVotes += 1;
	}
	if (lastFirstVotes > firstLastVotes) return "last-first";
	if (firstLastVotes > lastFirstVotes) return "first-last";
	return "last-first";
}
function headerLooksLikeMonth(header) {
	const norm = normalizeText(header);
	for (const entry of MONTH_ALIASES) if (entry.names.includes(norm) || norm.startsWith(entry.names[0])) return String(entry.month).padStart(2, "0");
	const iso = header.match(/(20\d{2})[-./](0[1-9]|1[0-2])/);
	if (iso) return `${iso[1]}-${iso[2]}`;
	const short = header.match(/^(0?[1-9]|1[0-2])$/);
	if (short) return short[1].padStart(2, "0");
	return null;
}
var TITLE_NOISE = /* @__PURE__ */ new Set([
	"przelew",
	"przychodzacy",
	"przychodzace",
	"elixir",
	"wplata",
	"tytulem",
	"tytul",
	"zajecia",
	"zajec",
	"miesiac",
	"miesiaca",
	"online",
	"ekspresowy",
	"zwykly",
	"rachunku",
	"rachunek",
	"od",
	"dla",
	"syna",
	"corki",
	"dziecka",
	"syn",
	"corka",
	"za",
	"mkonto",
	"intensive",
	"wplywy",
	"inne",
	"wewnetrzny",
	"mbank",
	"ul"
]);
function levenshtein(a, b) {
	if (a === b) return 0;
	if (!a.length) return b.length;
	if (!b.length) return a.length;
	const dp = Array.from({ length: a.length + 1 }, () => Array.from({ length: b.length + 1 }, () => 0));
	for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
	for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
	for (let i = 1; i <= a.length; i += 1) for (let j = 1; j <= b.length; j += 1) {
		const cost = a[i - 1] === b[j - 1] ? 0 : 1;
		dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
	}
	return dp[a.length][b.length];
}
function similarity(a, b) {
	if (!a || !b) return 0;
	if (a === b) return 1;
	if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) / Math.max(a.length, b.length);
	return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}
function tokensOf(text) {
	return normalizeText(text).split(" ").filter((t) => t.length > 1 && !TITLE_NOISE.has(t));
}
function groupScore(titleNorm, groupName, allGroups) {
	const groupNorm = normalizeText(groupName);
	if (!groupNorm) return {
		score: 0,
		reason: ""
	};
	const others = allGroups.map((g) => normalizeText(g.name)).filter((n) => n && n !== groupNorm);
	if (titleNorm.includes(groupNorm)) {
		if (others.some((other) => other.includes(groupNorm) && titleNorm.includes(other))) return {
			score: .04,
			reason: `część nazwy grupy „${groupName}”`
		};
		return {
			score: .14,
			reason: `grupa „${groupName}”`
		};
	}
	if (!groupNorm.split(" ").filter((t) => t.length > 2).some((t) => titleNorm.includes(t))) return {
		score: 0,
		reason: ""
	};
	if (others.some((other) => {
		if (!other.includes(groupNorm.split(" ")[0] ?? "")) return false;
		return other.length > groupNorm.length && titleNorm.includes(other);
	})) return {
		score: 0,
		reason: ""
	};
	return {
		score: .05,
		reason: "część nazwy grupy"
	};
}
function scoreParticipant(title, participant, groups) {
	const titleNorm = normalizeText(title);
	const first = normalizeText(participant.firstName);
	const last = normalizeText(participant.lastName);
	const group = groups.find((g) => g.id === participant.groupId);
	const reasons = [];
	let score = 0;
	const full = `${first} ${last}`.trim();
	const reversed = `${last} ${first}`.trim();
	if (full && (titleNorm.includes(full) || titleNorm.includes(reversed))) {
		score += .72;
		reasons.push("pełne imię i nazwisko w tytule");
	} else {
		const titleTokens = tokensOf(title);
		let lastBest = 0;
		let firstBest = 0;
		for (const token of titleTokens) {
			lastBest = Math.max(lastBest, similarity(token, last));
			firstBest = Math.max(firstBest, similarity(token, first));
			if (first.length >= 1 && token === first[0]) firstBest = Math.max(firstBest, .55);
		}
		if (lastBest >= .86) {
			score += .5 * lastBest;
			reasons.push(lastBest > .97 ? "nazwisko" : "podobne nazwisko");
		}
		if (firstBest >= .7) {
			score += .22 * firstBest;
			reasons.push(firstBest > .95 ? "imię" : "inicjał / podobne imię");
		}
	}
	if (group) {
		const g = groupScore(titleNorm, group.name, groups);
		if (g.score) {
			score += g.score;
			reasons.push(g.reason);
		}
	}
	return {
		score: Math.min(score, .99),
		reasons
	};
}
function amountIssue(expected, received) {
	if (Math.abs(expected - received) <= 1) return "ok";
	if (received < expected) return "partial";
	if (received > expected) return "over";
	return "unexpected";
}
function matchTransfers(params) {
	const { transfers, participants, groups, statementMonth, existing } = params;
	const taken = new Set(existing.filter((m) => m.kind === "confirmed" || m.kind === "manual").map((m) => m.transferId));
	const year = Number(statementMonth.slice(0, 4));
	const seasonYear = Number(statementMonth.slice(5, 7)) >= 9 ? year : year - 1;
	const next = existing.filter((m) => m.kind === "confirmed" || m.kind === "manual");
	const active = participants.filter((p) => p.active);
	for (const transfer of transfers) {
		if (transfer.ignored || transfer.direction === "out" || taken.has(transfer.id)) continue;
		if (transfer.amount <= 0) continue;
		const scored = active.map((p) => {
			const { score, reasons } = scoreParticipant(transfer.title, p, groups);
			return {
				participant: p,
				score,
				reasons
			};
		}).sort((a, b) => b.score - a.score);
		const best = scored[0];
		const second = scored[1];
		if (!best || best.score < .48) continue;
		const unique = !second || best.score - second.score >= .12 || best.score >= .85;
		if (!unique && best.score < .78) continue;
		const months = detectMonthsInText(transfer.title, seasonYear);
		const month = months.find((m) => m === statementMonth) ?? months[0] ?? statementMonth;
		const monthMismatch = months.length > 0 && !months.includes(statementMonth);
		if (monthMismatch) best.reasons.push(`tytuł wskazuje ${months[0]}`);
		const issue = amountIssue(best.participant.monthlyFee, transfer.amount);
		if (issue === "partial") best.reasons.push("kwota niższa niż stawka");
		if (issue === "over") {
			if (transfer.amount >= best.participant.monthlyFee * 1.8) best.reasons.push("kwota wygląda na dwa miesiące");
			else best.reasons.push("nadpłata");
		}
		const kind = best.score >= .78 && unique && issue === "ok" && !monthMismatch ? "auto" : "suggested";
		next.push({
			id: uid("match"),
			transferId: transfer.id,
			participantId: best.participant.id,
			month,
			amount: transfer.amount,
			confidence: best.score,
			kind,
			amountIssue: issue,
			reasons: best.reasons
		});
	}
	return next;
}
function buildManualMatch(params) {
	return {
		id: uid("match"),
		transferId: params.transfer.id,
		participantId: params.participant.id,
		month: params.month,
		amount: params.transfer.amount,
		confidence: 1,
		kind: "manual",
		amountIssue: amountIssue(params.participant.monthlyFee, params.transfer.amount),
		reasons: ["dopasowane ręcznie"]
	};
}
function nameKey(p) {
	return normalizeText(`${p.firstName} ${p.lastName}`);
}
var DEMO_MONTH = "2026-09";
function demoGroups() {
	return [
		{
			id: "g-seniorzy",
			name: "SENIORZY",
			defaultFee: 210
		},
		{
			id: "g-seniorzy-ii",
			name: "SENIORZY II",
			defaultFee: 220
		},
		{
			id: "g-taniec",
			name: "TANIEC SENIORZY",
			defaultFee: 220
		}
	];
}
function demoParticipants() {
	return [{
		id: uid("p"),
		firstName: "Paweł",
		lastName: "Zajk",
		groupId: "g-seniorzy",
		monthlyFee: 210,
		notes: "",
		active: true
	}, {
		id: uid("p"),
		firstName: "Julia",
		lastName: "Zajk",
		groupId: "g-seniorzy-ii",
		monthlyFee: 220,
		notes: "",
		active: true
	}];
}
var DEMO_STATEMENT_LINES = [
	"mBank S.A. Bankowość Detaliczna",
	"Lista operacji za okres od 2026-09-01 do 2026-09-02",
	"dla rachunków:",
	"mKonto Intensive",
	"Waluta Wpływy Wydatki",
	"PLN 10,00 -224,98",
	"Operacje",
	"Data operacji Opis operacji Rachunek Kategoria Kwota",
	"2026-09-02 JULIA ZAJK, JULIA ZAJK SENIORZY WRZESIEŃ mKonto Intensive Wpływy - inne 10,00 PLN",
	"UL.SAMBORA 2B 81-235 GDYNIA PRZELEW WEWNĘTRZNY PRZYCHODZĄCY",
	"2026-09-02 PRZYCHOD. DLA ZWIERZAT SC mKonto Intensive Zwierzęta -93,00 PLN",
	"ZAKUP PRZY UŻYCIU KARTY W KRAJU transakcja nierozliczona",
	"2026-09-01 TESLA POLAND SP. Z O. O. mKonto Intensive Serwis i części -34,99 PLN",
	"ZAKUP PRZY UŻYCIU KARTY - INTERNET",
	"2026-09-01 Leroy Merlin mKonto Intensive Akcesoria i wyposażenie -52,49 PLN",
	"ZAKUP PRZY UŻYCIU KARTY W KRAJU",
	"2026-09-01 ACTIVE FLOW ARENA mKonto Intensive Sport i hobby -4,50 PLN",
	"ZAKUP PRZY UŻYCIU KARTY W KRAJU",
	"2026-09-01 HTTPS://APP.FITSSEY.COM/A mKonto Intensive Sport i hobby -40,00 PLN",
	"BLIK ZAKUP E-COMMERCE"
];
function demoTransfers(statementId) {
	return [
		[
			"2026-09-02",
			10,
			"JULIA ZAJK, JULIA ZAJK SENIORZY WRZESIEŃ PRZELEW WEWNĘTRZNY PRZYCHODZĄCY",
			"in"
		],
		[
			"2026-09-02",
			93,
			"PRZYCHOD. DLA ZWIERZAT SC ZAKUP PRZY UŻYCIU KARTY W KRAJU",
			"out"
		],
		[
			"2026-09-01",
			34.99,
			"TESLA POLAND SP. Z O. O. ZAKUP PRZY UŻYCIU KARTY - INTERNET",
			"out"
		],
		[
			"2026-09-01",
			52.49,
			"Leroy Merlin ZAKUP PRZY UŻYCIU KARTY W KRAJU",
			"out"
		],
		[
			"2026-09-01",
			4.5,
			"ACTIVE FLOW ARENA ZAKUP PRZY UŻYCIU KARTY W KRAJU",
			"out"
		],
		[
			"2026-09-01",
			40,
			"HTTPS://APP.FITSSEY.COM/A BLIK ZAKUP E-COMMERCE",
			"out"
		]
	].map(([date, amount, title, direction]) => ({
		id: uid("tr"),
		statementId,
		date,
		amount,
		title,
		sender: "",
		raw: `${date} ${amount.toFixed(2)} ${title}`,
		direction,
		ignored: direction === "out"
	}));
}
var NAME_HEADERS = [
	"imie i nazwisko",
	"imię i nazwisko",
	"uczestnik",
	"osoba",
	"nazwa",
	"name",
	"participant"
];
var FIRST_HEADERS = [
	"imie",
	"imię",
	"first",
	"firstname"
];
var LAST_HEADERS = [
	"nazwisko",
	"last",
	"lastname"
];
var GROUP_HEADERS = [
	"grupa",
	"zajecia",
	"zajęcia",
	"group",
	"pracownia",
	"sekcja"
];
var FEE_HEADERS = [
	"kwota",
	"oplata",
	"opłata",
	"stawka",
	"fee",
	"naleznosc",
	"należność",
	"pln",
	"miesiecznie",
	"miesięcznie"
];
var NON_GROUP_HEADERS = /* @__PURE__ */ new Set([
	"regulamin",
	"zgoda",
	"rodo",
	"uwagi",
	"notes",
	"email",
	"e mail",
	"telefon",
	"tel",
	"adres",
	"pesel",
	"lp",
	"nr",
	"id"
]);
var TRUE_CELLS = /* @__PURE__ */ new Set([
	"tak",
	"ok",
	"wplacono",
	"yes",
	"x",
	"v",
	"true",
	"prawda",
	"1"
]);
var FALSE_CELLS = /* @__PURE__ */ new Set([
	"nie",
	"brak",
	"0",
	"n",
	"no",
	"false",
	"falsz"
]);
function cell(v) {
	if (v == null) return "";
	if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
	if (v instanceof Date) return v.toISOString().slice(0, 10);
	return String(v).trim();
}
function findHeader(headers, aliases) {
	return headers.findIndex((h) => aliases.includes(normalizeText(h)));
}
function isTruthyCell(value) {
	return TRUE_CELLS.has(normalizeText(value));
}
function isFalsyCell(value) {
	return FALSE_CELLS.has(normalizeText(value));
}
function isBooleanCell(value) {
	if (!value) return false;
	return isTruthyCell(value) || isFalsyCell(value);
}
function isPaidCell(value) {
	const n = normalizeText(value);
	if (!n) return {
		paid: false,
		amount: null
	};
	if (FALSE_CELLS.has(n)) return {
		paid: false,
		amount: 0
	};
	if (TRUE_CELLS.has(n)) return {
		paid: true,
		amount: null
	};
	const amount = Number(n.replace(",", ".").replace(/\s/g, ""));
	if (Number.isFinite(amount) && amount > 0) return {
		paid: true,
		amount
	};
	return {
		paid: false,
		amount: null
	};
}
function columnLooksBoolean(rows, index) {
	const values = rows.map((r) => r[index] ?? "").filter((v) => v.length > 0);
	if (values.length === 0) return false;
	return values.every((v) => isBooleanCell(v));
}
function detectGroupFlags(headers, rows, mapping) {
	const used = /* @__PURE__ */ new Set();
	for (const idx of [
		mapping.fullName,
		mapping.firstName,
		mapping.lastName,
		mapping.group,
		mapping.fee
	]) if (idx != null) used.add(idx);
	for (const idx of Object.values(mapping.months)) used.add(idx);
	const flags = [];
	headers.forEach((header, i) => {
		if (used.has(i)) return;
		const name = header.trim();
		if (!name) return;
		const norm = normalizeText(name);
		if (NON_GROUP_HEADERS.has(norm)) return;
		if (headerLooksLikeMonth(name)) return;
		if (!columnLooksBoolean(rows, i)) return;
		flags.push({
			column: i,
			name
		});
	});
	return flags;
}
function guessMapping(headers, seasonYear, rows = []) {
	const mapping = { months: {} };
	const first = findHeader(headers, FIRST_HEADERS);
	const last = findHeader(headers, LAST_HEADERS);
	const full = findHeader(headers, NAME_HEADERS);
	const group = findHeader(headers, GROUP_HEADERS);
	const fee = findHeader(headers, FEE_HEADERS);
	if (first >= 0) mapping.firstName = first;
	if (last >= 0) mapping.lastName = last;
	if (full >= 0 && first < 0) mapping.fullName = full;
	if (group >= 0) mapping.group = group;
	if (fee >= 0) mapping.fee = fee;
	headers.forEach((h, i) => {
		const month = headerLooksLikeMonth(h);
		if (!month) return;
		const key = month.includes("-") ? month : monthKeyFor(Number(month), seasonYear);
		mapping.months[key] = i;
	});
	if (mapping.firstName == null && mapping.fullName == null) mapping.fullName = 0;
	if (rows.length) {
		mapping.groupFlags = detectGroupFlags(headers, rows, mapping);
		if (mapping.fullName != null) mapping.nameOrder = guessNameOrder(rows.map((r) => r[mapping.fullName] ?? "").filter(Boolean));
	}
	return mapping;
}
function interpretExcelRow(row, mapping) {
	const first = mapping.firstName != null ? row[mapping.firstName] ?? "" : "";
	const last = mapping.lastName != null ? row[mapping.lastName] ?? "" : "";
	const full = mapping.fullName != null ? row[mapping.fullName] ?? "" : "";
	const order = mapping.nameOrder ?? "last-first";
	const names = first || last ? {
		firstName: first.trim(),
		lastName: last.trim()
	} : splitFullName(full, order);
	if (!names.firstName && !names.lastName) return null;
	let groupName = "";
	if (mapping.groupFlags?.length) groupName = mapping.groupFlags.filter((g) => isTruthyCell(row[g.column] ?? "")).map((g) => g.name).join(" + ");
	if (!groupName && mapping.group != null) groupName = (row[mapping.group] ?? "").trim();
	if (!groupName) groupName = "Bez grupy";
	const feeRaw = mapping.fee != null ? row[mapping.fee] ?? "" : "";
	const fee = Number(String(feeRaw).replace(",", ".").replace(/\s/g, "")) || 0;
	return {
		...names,
		groupName,
		fee
	};
}
async function readSpreadsheet(file) {
	return readSpreadsheetBuffer(await file.arrayBuffer());
}
function readSpreadsheetBuffer(buf) {
	const wb = readSync(buf, {
		type: "array",
		cellDates: true
	});
	const sheetName = wb.SheetNames[0];
	const sheet = wb.Sheets[sheetName];
	if (!sheet) throw new Error("Pusty plik Excel.");
	const cleaned = utils.sheet_to_json(sheet, {
		header: 1,
		raw: false,
		defval: ""
	}).map((row) => row.map(cell)).filter((row) => row.some((c) => c.length > 0));
	if (!cleaned.length) throw new Error("Nie znaleziono wierszy w arkuszu.");
	return {
		sheetName,
		headers: cleaned[0],
		rows: cleaned.slice(1)
	};
}
function emptyState() {
	return {
		seasonStartYear: currentSeasonStartYear(),
		selectedMonth: currentMonthKey(),
		groups: [],
		participants: [],
		statements: [],
		transfers: [],
		matches: [],
		manual: {},
		seeded: false,
		seedBanner: false
	};
}
function persistable(state) {
	return {
		seasonStartYear: state.seasonStartYear,
		selectedMonth: state.selectedMonth,
		groups: state.groups,
		participants: state.participants,
		statements: state.statements,
		transfers: state.transfers,
		matches: state.matches,
		manual: state.manual,
		seeded: state.seeded,
		seedBanner: state.seedBanner
	};
}
var useValdek = create()(persist((set, get) => ({
	...emptyState(),
	hydrated: false,
	setHydrated: (v) => set({ hydrated: v }),
	seedDemo: () => {
		const groups = demoGroups();
		const participants = demoParticipants();
		const statementId = uid("st");
		const statement = {
			id: statementId,
			fileName: "lista_operacji_wrzesien.pdf",
			month: DEMO_MONTH,
			importedAt: (/* @__PURE__ */ new Date()).toISOString(),
			transferCount: 1
		};
		const transfers = demoTransfers(statementId);
		const matches = matchTransfers({
			transfers,
			participants,
			groups,
			statementMonth: DEMO_MONTH,
			existing: []
		});
		set({
			seasonStartYear: 2026,
			selectedMonth: DEMO_MONTH,
			groups,
			participants,
			statements: [statement],
			transfers,
			matches,
			manual: {},
			seeded: true,
			seedBanner: true
		});
	},
	resetAll: () => set({
		...emptyState(),
		hydrated: true,
		seeded: true,
		seedBanner: false
	}),
	dismissSeedBanner: () => set({ seedBanner: false }),
	setMonth: (month) => set({ selectedMonth: month }),
	setSeasonStartYear: (year) => set({ seasonStartYear: year }),
	addGroup: (name, defaultFee) => {
		const id = uid("g");
		set({ groups: [...get().groups, {
			id,
			name,
			defaultFee
		}] });
		return id;
	},
	updateGroup: (id, patch) => set({ groups: get().groups.map((g) => g.id === id ? {
		...g,
		...patch
	} : g) }),
	removeGroup: (id) => {
		const leftover = get().groups.find((g) => g.id !== id);
		set({
			groups: get().groups.filter((g) => g.id !== id),
			participants: get().participants.map((p) => p.groupId === id && leftover ? {
				...p,
				groupId: leftover.id
			} : p)
		});
	},
	addParticipant: (draft) => set({ participants: [...get().participants, {
		...draft,
		id: uid("p")
	}] }),
	updateParticipant: (id, patch) => set({ participants: get().participants.map((p) => p.id === id ? {
		...p,
		...patch
	} : p) }),
	removeParticipant: (id) => set({
		participants: get().participants.filter((p) => p.id !== id),
		matches: get().matches.filter((m) => m.participantId !== id)
	}),
	importRows: (rows, mapping, mode) => {
		const wipingDemo = get().seedBanner;
		let groups = mode === "replace" || wipingDemo ? [] : [...get().groups];
		const ensureGroup = (name, fee) => {
			const existing = groups.find((g) => g.name.toLowerCase() === name.toLowerCase());
			if (existing) return existing.id;
			const id = uid("g");
			groups = [...groups, {
				id,
				name,
				defaultFee: fee || 0
			}];
			return id;
		};
		const imported = [];
		for (const row of rows) {
			const parsed = interpretExcelRow(row, mapping);
			if (!parsed) continue;
			const groupId = ensureGroup(parsed.groupName || "Bez grupy", parsed.fee);
			imported.push({
				id: uid("p"),
				firstName: parsed.firstName,
				lastName: parsed.lastName,
				groupId,
				monthlyFee: parsed.fee,
				notes: "",
				active: true
			});
		}
		let participants = mode === "replace" || wipingDemo ? imported : [...get().participants];
		if (mode === "merge" && !wipingDemo) {
			const index = new Map(participants.map((p) => [nameKey(p), p]));
			for (const row of imported) {
				const key = nameKey(row);
				const prev = index.get(key);
				if (prev) participants = participants.map((p) => p.id === prev.id ? {
					...p,
					groupId: row.groupId,
					monthlyFee: row.monthlyFee || p.monthlyFee
				} : p);
				else {
					participants = [...participants, row];
					index.set(key, row);
				}
			}
		}
		const manual = wipingDemo || mode === "replace" ? {} : { ...get().manual };
		if (mapping.months && Object.keys(mapping.months).length) for (const row of rows) {
			const parsed = interpretExcelRow(row, mapping);
			if (!parsed) continue;
			const person = participants.find((p) => nameKey(p) === nameKey(parsed));
			if (!person) continue;
			for (const [month, col] of Object.entries(mapping.months)) {
				const cell = row[col] ?? "";
				const paid = isPaidCell(cell);
				if (!cell) continue;
				manual[person.id] = manual[person.id] ?? {};
				if (paid.paid) manual[person.id][month] = {
					status: paid.amount && paid.amount < (person.monthlyFee || paid.amount) ? "partial" : "paid",
					amount: paid.amount ?? person.monthlyFee
				};
				else if (paid.amount === 0) continue;
			}
		}
		set({
			groups,
			participants,
			manual,
			seeded: true,
			seedBanner: false,
			...wipingDemo ? {
				statements: [],
				transfers: [],
				matches: []
			} : {}
		});
		get().rematch();
		return imported.length;
	},
	addStatement: (statement, transfers) => {
		const replacedIds = new Set(get().statements.filter((s) => s.id === statement.id || s.month === statement.month || s.fileName === statement.fileName).map((s) => s.id));
		set({
			statements: [...get().statements.filter((s) => !replacedIds.has(s.id)), statement],
			transfers: [...get().transfers.filter((t) => !replacedIds.has(t.statementId)), ...transfers],
			selectedMonth: statement.month || get().selectedMonth,
			seeded: true,
			seedBanner: false
		});
		get().rematch();
	},
	removeStatement: (id) => {
		const transferIds = new Set(get().transfers.filter((t) => t.statementId === id).map((t) => t.id));
		set({
			statements: get().statements.filter((s) => s.id !== id),
			transfers: get().transfers.filter((t) => t.statementId !== id),
			matches: get().matches.filter((m) => !transferIds.has(m.transferId))
		});
	},
	updateTransfer: (id, patch) => {
		set({ transfers: get().transfers.map((t) => t.id === id ? {
			...t,
			...patch
		} : t) });
		get().rematch();
	},
	ignoreTransfer: (id, ignored) => {
		set({
			transfers: get().transfers.map((t) => t.id === id ? {
				...t,
				ignored
			} : t),
			matches: ignored ? get().matches.filter((m) => m.transferId !== id) : get().matches
		});
		if (!ignored) get().rematch();
	},
	rematch: () => {
		const { transfers, participants, groups, selectedMonth, matches } = get();
		set({ matches: matchTransfers({
			transfers,
			participants,
			groups,
			statementMonth: selectedMonth,
			existing: matches
		}) });
	},
	assignTransfer: (transferId, participantId, month) => {
		const transfer = get().transfers.find((t) => t.id === transferId);
		const participant = get().participants.find((p) => p.id === participantId);
		if (!transfer || !participant) return;
		const next = buildManualMatch({
			transfer,
			participant,
			month: month ?? get().selectedMonth
		});
		set({ matches: [...get().matches.filter((m) => m.transferId !== transferId), next] });
	},
	unmatchTransfer: (transferId) => set({ matches: get().matches.filter((m) => m.transferId !== transferId) }),
	confirmMatch: (transferId) => set({ matches: get().matches.map((m) => m.transferId === transferId ? {
		...m,
		kind: "confirmed"
	} : m) }),
	splitTwoMonths: (transferId) => {
		const match = get().matches.find((m) => m.transferId === transferId);
		const transfer = get().transfers.find((t) => t.id === transferId);
		const person = get().participants.find((p) => p.id === match?.participantId);
		if (!match || !transfer || !person) return;
		const fee = person.monthlyFee || transfer.amount / 2;
		const [y, m] = match.month.split("-").map(Number);
		const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
		const first = {
			...match,
			id: uid("match"),
			amount: fee,
			amountIssue: "ok",
			kind: "manual",
			reasons: ["rozliczone jako dwa miesiące"]
		};
		const second = {
			...match,
			id: uid("match"),
			month: nextMonth,
			amount: transfer.amount - fee,
			amountIssue: "ok",
			kind: "manual",
			reasons: ["druga rata z tej samej wpłaty"]
		};
		set({ matches: [
			...get().matches.filter((m) => m.transferId !== transferId),
			first,
			second
		] });
	},
	setManual: (participantId, month, mark) => {
		const manual = { ...get().manual };
		const current = { ...manual[participantId] ?? {} };
		if (!mark) delete current[month];
		else current[month] = mark;
		manual[participantId] = current;
		set({ manual });
	}
}), {
	name: "valdek-store-v2",
	storage: createJSONStorage(() => localStorage),
	skipHydration: true,
	partialize: persistable
}));
function receivedFor(participantId, month, matches) {
	return matches.filter((m) => m.participantId === participantId && m.month === month).reduce((sum, m) => sum + m.amount, 0);
}
function HydrateStore({ children }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function boot() {
			try {
				await useValdek.persist.rehydrate();
				const state = useValdek.getState();
				if (!state.seeded && state.participants.length === 0) state.seedDemo();
				state.setHydrated(true);
			} catch {
				try {
					useValdek.getState().seedDemo();
				} catch {}
			}
			if (!cancelled) setReady(true);
		}
		boot();
		return () => {
			cancelled = true;
		};
	}, []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-background text-muted-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-display text-4xl text-foreground",
				children: "Valdek"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm",
				children: "Otwieranie kasy…"
			})]
		})
	});
	return children;
}
var styles_default = "/assets/styles-DLw5ks4C.css";
var APP_NAME = "Valdek";
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Valdek — kasa teatralna. Porównuje wyciąg bankowy z listą uczestników. Dane zostają na tym komputerze."
			},
			{
				name: "theme-color",
				content: "#0e0c0b"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Outfit:wght@360;420;500;580&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "pl",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-background text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
					delayDuration: 200,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HydrateStore, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$3 = () => import("./routes-CvLhTgH-.mjs");
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./rozliczenie-CO0M4QAW.mjs");
var Route$2 = createFileRoute("/rozliczenie")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./uczestnicy-CIuZ6hON.mjs");
var Route$1 = createFileRoute("/uczestnicy")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./wyciag-CKb9MkbK.mjs");
var Route = createFileRoute("/wyciag")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	RozliczenieRoute: Route$2.update({
		id: "/rozliczenie",
		path: "/rozliczenie",
		getParentRoute: () => Route$4
	}),
	UczestnicyRoute: Route$1.update({
		id: "/uczestnicy",
		path: "/uczestnicy",
		getParentRoute: () => Route$4
	}),
	WyciagRoute: Route.update({
		id: "/wyciag",
		path: "/wyciag",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { downloadBlob as _, interpretExcelRow as a, PL_MONTHS as c, monthShort as d, normalizeText as f, cn as g, seasonMonths as h, guessMapping as i, fullName as l, parsePln as m, receivedFor as n, readSpreadsheet as o, parseLooseDate as p, useValdek as r, DEMO_STATEMENT_LINES as s, router_exports as t, monthLabel as u, formatPln as v, uid as y };
