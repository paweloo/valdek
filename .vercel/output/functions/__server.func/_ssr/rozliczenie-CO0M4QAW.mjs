import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as Unlink, p as Link2, s as Split, y as Check } from "../_libs/lucide-react.mjs";
import { f as normalizeText, h as seasonMonths, l as fullName, r as useValdek, u as monthLabel, v as formatPln } from "./router-1VjxVlmk.mjs";
import { a as SelectContent, c as SelectValue, i as Select, o as SelectItem, r as Button, s as SelectTrigger, t as AppShell } from "./badge-C1Z3XjVs.mjs";
import { n as bucketForMatches, r as monthStatusFor, t as StatusBadge } from "./status-badge-CWf4SsHv.mjs";
import { t as Input } from "./input-Do6sEwmf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rozliczenie-CO0M4QAW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RozliczeniePage() {
	const selectedMonth = useValdek((s) => s.selectedMonth);
	const seasonStartYear = useValdek((s) => s.seasonStartYear);
	const allParticipants = useValdek((s) => s.participants);
	const groups = useValdek((s) => s.groups);
	const transfers = useValdek((s) => s.transfers);
	const matches = useValdek((s) => s.matches);
	const manual = useValdek((s) => s.manual);
	const assignTransfer = useValdek((s) => s.assignTransfer);
	const confirmMatch = useValdek((s) => s.confirmMatch);
	const unmatchTransfer = useValdek((s) => s.unmatchTransfer);
	const splitTwoMonths = useValdek((s) => s.splitTwoMonths);
	const [query, setQuery] = (0, import_react.useState)("");
	const participants = allParticipants.filter((p) => p.active);
	const visibleTransfers = transfers.filter((t) => !t.ignored && t.direction !== "out");
	const unmatched = visibleTransfers.filter((t) => bucketForMatches(matches.filter((m) => m.transferId === t.id)) === "unmatched");
	const review = visibleTransfers.filter((t) => bucketForMatches(matches.filter((m) => m.transferId === t.id)) === "review");
	const confirmed = visibleTransfers.filter((t) => bucketForMatches(matches.filter((m) => m.transferId === t.id)) === "booked");
	const people = (0, import_react.useMemo)(() => {
		const q = normalizeText(query);
		return participants.filter((p) => {
			const g = groups.find((x) => x.id === p.groupId)?.name ?? "";
			return !q || normalizeText(`${p.firstName} ${p.lastName} ${g}`).includes(q);
		});
	}, [
		participants,
		groups,
		query
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-7xl flex-col gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
					children: "Kasa"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-1 text-4xl",
					children: "Rozliczenie"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted-foreground",
					children: "Po lewej przelewy, po prawej lista. Potwierdź pewne dopasowania, przypisz kwiatki ręcznie, pomiń składki i obce wpłaty."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "lg:max-w-72",
				placeholder: "Filtruj uczestników",
				value: query,
				onChange: (e) => setQuery(e.target.value)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 xl:grid-cols-[1.15fr_0.85fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransferGroup, {
						title: "Do wyjaśnienia",
						empty: "Brak nierozpoznanych przelewów.",
						items: unmatched,
						months: seasonMonths(seasonStartYear),
						selectedMonth,
						participants: people,
						groups,
						matches,
						onAssign: assignTransfer
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransferGroup, {
						title: "Do potwierdzenia",
						empty: "Nic nie czeka na Twoje oko.",
						items: review,
						months: seasonMonths(seasonStartYear),
						selectedMonth,
						participants: people,
						groups,
						matches,
						onAssign: assignTransfer,
						onConfirm: confirmMatch,
						onUnmatch: unmatchTransfer,
						onSplit: splitTwoMonths
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransferGroup, {
						title: "Zaksięgowane",
						empty: "Jeszcze nikt nie został pewnie dopasowany.",
						items: confirmed,
						months: seasonMonths(seasonStartYear),
						selectedMonth,
						participants: people,
						groups,
						matches,
						onUnmatch: unmatchTransfer
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "rounded-xl bg-card p-4 shadow-[var(--shadow-border)] xl:sticky xl:top-24 xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Lista miesiąca"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-border",
					children: people.map((p) => {
						const st = monthStatusFor(p, selectedMonth, matches, manual);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-sm font-medium",
									children: fullName(p.firstName, p.lastName)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "truncate text-xs text-muted-foreground",
									children: [
										groups.find((g) => g.id === p.groupId)?.name,
										" · ",
										formatPln(p.monthlyFee)
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: st.status })]
						}, p.id);
					})
				})]
			})]
		})]
	}) });
}
function TransferGroup({ title, empty, items, months, selectedMonth, participants, groups, matches, onAssign, onConfirm, onUnmatch, onSplit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display mb-3 text-2xl",
		children: title
	}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: empty
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-3",
		children: items.map((t) => {
			const primary = matches.filter((m) => m.transferId === t.id)[0];
			const person = participants.find((p) => p.id === primary?.participantId);
			const amountStatus = primary && primary.amountIssue !== "ok" ? primary.amountIssue === "partial" ? "partial" : "over" : null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-baseline gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular text-lg",
										children: formatPln(t.amount)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: t.date
									}),
									amountStatus ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: amountStatus }) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm",
								children: t.title
							}),
							primary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: [
									person ? fullName(person.firstName, person.lastName) : "osoba spoza filtra",
									" · ",
									monthLabel(primary.month),
									" · ",
									Math.round(primary.confidence * 100),
									"% · ",
									primary.reasons.join(" · ")
								]
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-col gap-2 md:w-72",
						children: [
							onAssign ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: primary?.participantId ?? "__none",
								onValueChange: (id) => {
									if (id === "__none") return;
									onAssign(t.id, id, primary?.month ?? selectedMonth);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Przypisz do osoby" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none",
									disabled: true,
									children: "Przypisz do osoby"
								}), participants.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: p.id,
									children: [
										fullName(p.firstName, p.lastName),
										" · ",
										groups.find((g) => g.id === p.groupId)?.name
									]
								}, p.id))] })]
							}) : null,
							onAssign && primary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: primary.month,
								onValueChange: (m) => onAssign(t.id, primary.participantId, m),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: months.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: m,
									children: monthLabel(m)
								}, m)) })]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									onConfirm && primary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										onClick: () => onConfirm(t.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}), " Potwierdź"]
									}) : null,
									onSplit && primary && primary.amountIssue === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "secondary",
										onClick: () => onSplit(t.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Split, {}), " Dwa miesiące"]
									}) : null,
									onUnmatch && primary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "ghost",
										onClick: () => onUnmatch(t.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unlink, {}), " Odłącz"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-3" }), " przypisz z listy"]
									})
								]
							})
						]
					})]
				})
			}, t.id);
		})
	})] });
}
//#endregion
export { RozliczeniePage as component };
