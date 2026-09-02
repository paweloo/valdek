import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as FileSpreadsheet, l as Scale, m as FileText, t as X } from "../_libs/lucide-react.mjs";
import { d as formatPln, l as cn, m as monthLabel, p as fullName, r as useValdek } from "./router-DrK5C4N1.mjs";
import { r as Button, t as AppShell } from "./badge-DXSOSOLP.mjs";
import { r as monthStatusFor, t as StatusBadge } from "./status-badge-C0aCtrf5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CH1WLK6c.js
var import_jsx_runtime = require_jsx_runtime();
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl bg-card shadow-[var(--shadow-border)]", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 p-5 pb-0", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: cn("font-display text-2xl", className),
		...props
	});
}
function CardDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function CardContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("p-5", className),
		...props
	});
}
function Home() {
	const selectedMonth = useValdek((s) => s.selectedMonth);
	const allParticipants = useValdek((s) => s.participants);
	const groups = useValdek((s) => s.groups);
	const matches = useValdek((s) => s.matches);
	const allTransfers = useValdek((s) => s.transfers);
	const manual = useValdek((s) => s.manual);
	const seedBanner = useValdek((s) => s.seedBanner);
	const dismissSeedBanner = useValdek((s) => s.dismissSeedBanner);
	const seeded = useValdek((s) => s.seeded);
	const participants = allParticipants.filter((p) => p.active);
	const transfers = allTransfers.filter((t) => !t.ignored && t.direction !== "out");
	const statuses = participants.map((p) => ({
		p,
		...monthStatusFor(p, selectedMonth, matches, manual)
	}));
	const paid = statuses.filter((s) => s.status === "paid" || s.status === "over").length;
	const review = statuses.filter((s) => s.status === "review" || s.status === "partial").length;
	const unpaidPeople = statuses.filter((s) => s.status === "unpaid");
	const expected = participants.reduce((sum, p) => sum + p.monthlyFee, 0);
	const received = statuses.reduce((sum, s) => sum + s.received, 0);
	const unmatched = transfers.filter((t) => !matches.some((m) => m.transferId === t.id));
	const issues = matches.filter((m) => m.kind === "suggested");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-6xl flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
					children: "Sezon w kasie"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-1 text-4xl md:text-5xl",
					children: monthLabel(selectedMonth)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted-foreground",
					children: "Wgraj ewidencję z Excela i listę operacji z mBanku. Valdek zestawi nazwiska, grupy i kwoty — a kwiatki z tytułów zostawi do Twojej decyzji."
				})
			] }),
			seedBanner && seeded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4 rounded-xl bg-secondary px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "To podgląd na Twojej ewidencji (Zajkowie, grupy seniorów). Wgraj Excel i PDF z mBanku — nic nie wychodzi z tej przeglądarki. Eksport wraca do Twojego pliku z checkboxami."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "size-9 shrink-0",
					onClick: dismissSeedBanner,
					"aria-label": "Zamknij",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Wpłacono",
						value: `${paid} / ${participants.length}`,
						hint: formatPln(received)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Należność miesiąca",
						value: formatPln(expected),
						hint: "suma stawek"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Do wyjaśnienia",
						value: String(issues.length + unmatched.length),
						hint: `${review} osób · ${unmatched.length} przelewów`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionCard, {
						to: "/uczestnicy",
						icon: FileSpreadsheet,
						title: "Lista uczestników",
						copy: "Excel ewidencji: nazwisko i imię, stawka, kolumny SENIORZY / SENIORZY II / TANIEC SENIORZY i miesiące TAK/NIE."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionCard, {
						to: "/wyciag",
						icon: FileText,
						title: "Wyciąg z banku",
						copy: "Lista operacji z mBanku za miesiąc. Wpłaty przychodzące idą do kasy, zakupy kartą Valdek pomija."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionCard, {
						to: "/rozliczenie",
						icon: Scale,
						title: "Rozliczenie",
						copy: "Automatyczne dopasowanie plus ręczne potwierdzenia, gdy rodzic wpisze coś po swojemu."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Bez wpłaty" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
					"Osoby, których nie ma na wyciągu w ",
					monthLabel(selectedMonth),
					"."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: unpaidPeople.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Wszyscy z listy mają ślad wpłaty."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: unpaidPeople.slice(0, 8).map(({ p, expected: exp }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: fullName(p.firstName, p.lastName)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: groups.find((g) => g.id === p.groupId)?.name
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "tabular text-sm text-muted-foreground",
							children: formatPln(exp)
						})]
					}, p.id))
				}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Kwiatki z wyciągu" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Zła kwota, inny miesiąc, albo tytuł, którego kasa nie jest pewna." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [issues.length === 0 && unmatched.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Na razie czysto."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: issues.slice(0, 6).map((m) => {
						const person = participants.find((p) => p.id === m.participantId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-sm font-medium",
									children: person ? fullName(person.firstName, person.lastName) : "?"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-xs text-muted-foreground",
									children: m.reasons[0]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: m.amountIssue === "ok" ? "review" : m.amountIssue === "partial" ? "partial" : "over" })]
						}, m.id);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					className: "mt-4 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/rozliczenie",
						children: "Otwórz rozliczenie"
					})
				})] })] })]
			})
		]
	}) });
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs tracking-[0.16em] text-muted-foreground uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-display mt-2 text-3xl tabular",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
function ActionCard({ to, icon: Icon, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "group flex flex-col rounded-xl bg-card p-5 shadow-[var(--shadow-border)] transition-colors hover:bg-accent",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display mt-4 text-2xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: copy
			})
		]
	});
}
//#endregion
export { Home as component };
