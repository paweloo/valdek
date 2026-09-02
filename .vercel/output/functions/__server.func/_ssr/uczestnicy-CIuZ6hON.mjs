import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Download, d as Plus, l as Search, o as Trash2, r as Upload, t as X } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as utils, r as writeSync } from "../_libs/xlsx.mjs";
import { _ as downloadBlob, a as interpretExcelRow, c as PL_MONTHS, d as monthShort, f as normalizeText, g as cn, h as seasonMonths, i as guessMapping, l as fullName, o as readSpreadsheet, r as useValdek, u as monthLabel, v as formatPln } from "./router-1VjxVlmk.mjs";
import { a as SelectContent, c as SelectValue, i as Select, o as SelectItem, r as Button, s as SelectTrigger, t as AppShell } from "./badge-C1Z3XjVs.mjs";
import { r as monthStatusFor, t as StatusBadge } from "./status-badge-CWf4SsHv.mjs";
import { t as Input } from "./input-Do6sEwmf.mjs";
import { t as Textarea } from "./textarea-Bv_iCmIv.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/uczestnicy-CIuZ6hON.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-5 text-popover-foreground shadow-[var(--shadow-elevated)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring/70 focus:outline-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Zamknij"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5 pr-6", className),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("font-display text-2xl", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-sm font-medium text-muted-foreground", className),
	...props
}));
Label.displayName = Root.displayName;
var NONE = "__none__";
function ExcelImportDialog({ open, onOpenChange, file }) {
	const seasonStartYear = useValdek((s) => s.seasonStartYear);
	const seedBanner = useValdek((s) => s.seedBanner);
	const importRows = useValdek((s) => s.importRows);
	const [headers, setHeaders] = (0, import_react.useState)([]);
	const [rows, setRows] = (0, import_react.useState)([]);
	const [mapping, setMapping] = (0, import_react.useState)({ months: {} });
	const [mode, setMode] = (0, import_react.useState)("replace");
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!open || !file) {
			setReady(false);
			return;
		}
		let cancelled = false;
		readSpreadsheet(file).then((parsed) => {
			if (cancelled) return;
			setHeaders(parsed.headers);
			setRows(parsed.rows);
			setMapping(guessMapping(parsed.headers, seasonStartYear, parsed.rows));
			setMode(seedBanner ? "replace" : "merge");
			setReady(true);
		}).catch((err) => {
			toast.error(err instanceof Error ? err.message : "Nie udało się odczytać Excela");
			onOpenChange(false);
		});
		return () => {
			cancelled = true;
		};
	}, [
		file,
		open,
		seasonStartYear,
		onOpenChange,
		seedBanner
	]);
	const setField = (key, value) => {
		setMapping((m) => ({
			...m,
			[key]: value === NONE ? void 0 : Number(value)
		}));
	};
	const apply = () => {
		const count = importRows(rows, mapping, mode);
		toast.success(`Wczytano ${count} osób`);
		setReady(false);
		onOpenChange(false);
	};
	const colOptions = headers.map((h, i) => ({
		value: String(i),
		label: h || `Kolumna ${i + 1}`
	}));
	const preview = rows.map((row) => interpretExcelRow(row, mapping)).filter((p) => p != null).slice(0, 4);
	const groupNames = mapping.groupFlags?.map((g) => g.name) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Mapowanie kolumn" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Valdek czyta listę z grupami jako kolumny TAK/NIE i miesiącami. Popraw, jeśli nagłówki są inne." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapSelect, {
							label: "Imię i nazwisko (jedna kolumna)",
							value: mapping.fullName,
							options: colOptions,
							onChange: (v) => setField("fullName", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Kolejność w kolumnie" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mapping.nameOrder ?? "last-first",
								onValueChange: (v) => setMapping((m) => ({
									...m,
									nameOrder: v
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "last-first",
									children: "Nazwisko Imię (Zajk Julia)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "first-last",
									children: "Imię Nazwisko (Julia Zajk)"
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapSelect, {
							label: "Imię",
							value: mapping.firstName,
							options: colOptions,
							onChange: (v) => setField("firstName", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapSelect, {
							label: "Nazwisko",
							value: mapping.lastName,
							options: colOptions,
							onChange: (v) => setField("lastName", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapSelect, {
							label: "Grupa (jedna kolumna)",
							value: mapping.group,
							options: colOptions,
							onChange: (v) => setField("group", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapSelect, {
							label: "Stawka",
							value: mapping.fee,
							options: colOptions,
							onChange: (v) => setField("fee", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Jak wczytać" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mode,
								onValueChange: (v) => setMode(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "replace",
									children: "Zastąp całą listę"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "merge",
									children: "Scal z obecną listą"
								})] })]
							})]
						})
					]
				}),
				groupNames.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: ["Grupy z kolumn TAK/NIE: ", groupNames.join(" · ")]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-lg bg-secondary p-3",
					children: preview.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "text-sm",
						children: preview.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [fullName(p.firstName, p.lastName), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [" · ", p.groupName]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular text-muted-foreground",
								children: formatPln(p.fee)
							})]
						}, `${p.lastName}-${p.firstName}-${i}`))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Nie widzę osób w tym arkuszu."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => onOpenChange(false),
					children: "Anuluj"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: apply,
					disabled: !ready || preview.length === 0,
					children: "Wczytaj listę"
				})] })
			]
		})
	});
}
function MapSelect({ label, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: value == null ? NONE : String(value),
			onValueChange: onChange,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: NONE,
				children: "— pomiń —"
			}), options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: o.value,
				children: o.label
			}, o.value))] })]
		})]
	});
}
function ParticipantDialog({ open, onOpenChange, participant }) {
	const groups = useValdek((s) => s.groups);
	const addParticipant = useValdek((s) => s.addParticipant);
	const updateParticipant = useValdek((s) => s.updateParticipant);
	const addGroup = useValdek((s) => s.addGroup);
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [lastName, setLastName] = (0, import_react.useState)("");
	const [groupId, setGroupId] = (0, import_react.useState)("");
	const [fee, setFee] = (0, import_react.useState)("0");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [newGroup, setNewGroup] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setFirstName(participant?.firstName ?? "");
		setLastName(participant?.lastName ?? "");
		setGroupId(participant?.groupId ?? groups[0]?.id ?? "");
		setFee(String(participant?.monthlyFee ?? groups[0]?.defaultFee ?? 0));
		setNotes(participant?.notes ?? "");
		setNewGroup("");
	}, [
		open,
		participant,
		groups
	]);
	const save = () => {
		let gid = groupId;
		if (newGroup.trim()) {
			const group = groups.find((g) => g.id === gid);
			gid = addGroup(newGroup.trim(), Number(fee) || group?.defaultFee || 0);
		}
		const draft = {
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			groupId: gid,
			monthlyFee: Number(fee.replace(",", ".")) || 0,
			notes: notes.trim(),
			active: true
		};
		if (!draft.firstName && !draft.lastName) return;
		if (participant) updateParticipant(participant.id, draft);
		else addParticipant(draft);
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: participant ? "Edycja uczestnika" : "Nowy uczestnik" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Stawka może być inna niż w grupie — tu jest źródło prawdy przy rozliczeniu." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "first",
								children: "Imię"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "first",
								value: firstName,
								onChange: (e) => setFirstName(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "last",
								children: "Nazwisko"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "last",
								value: lastName,
								onChange: (e) => setLastName(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Grupa" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: groupId,
								onValueChange: (id) => {
									setGroupId(id);
									const g = groups.find((x) => x.id === id);
									if (g && !participant) setFee(String(g.defaultFee));
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Wybierz grupę" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: g.id,
									children: g.name
								}, g.id)) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Albo wpisz nową grupę",
								value: newGroup,
								onChange: (e) => setNewGroup(e.target.value)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "fee",
							children: "Stawka miesięczna (zł)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "fee",
							inputMode: "decimal",
							value: fee,
							onChange: (e) => setFee(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "notes",
							children: "Uwagi"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "notes",
							value: notes,
							onChange: (e) => setNotes(e.target.value)
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => onOpenChange(false),
				children: "Anuluj"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: save,
				children: "Zapisz"
			})] })
		] })
	});
}
function paymentReceived(participantId, month, matches, transfers) {
	return matches.filter((m) => m.participantId === participantId && m.month === month).reduce((sum, m) => {
		const t = transfers.find((x) => x.id === m.transferId);
		if (!t || t.ignored) return sum;
		return sum + m.amount;
	}, 0);
}
function monthHeader(monthKey) {
	const idx = Number(monthKey.slice(5, 7)) - 1;
	return (PL_MONTHS[idx] ?? monthKey).toUpperCase();
}
function buildWorkbook(params) {
	const months = seasonMonths(params.seasonStartYear);
	const groupNames = params.groups.map((g) => g.name);
	const headers = [
		"IMIĘ I NAZWISKO",
		"KWOTA",
		"REGULAMIN",
		...groupNames,
		...months.map(monthHeader)
	];
	const listRows = params.participants.map((p) => {
		const group = params.groups.find((g) => g.id === p.groupId)?.name ?? "";
		return [
			`${p.lastName} ${p.firstName}`.trim(),
			p.monthlyFee,
			false,
			...groupNames.map((name) => name === group),
			...months.map((month) => paymentReceived(p.id, month, params.matches, params.transfers) > 0)
		];
	});
	const detailRows = params.transfers.filter((t) => !t.ignored).map((t) => {
		const match = params.matches.find((m) => m.transferId === t.id);
		const person = params.participants.find((p) => p.id === match?.participantId);
		return {
			Data: t.date,
			Kwota: t.amount,
			Tytuł: t.title,
			Uczestnik: person ? fullName(person.firstName, person.lastName) : "",
			Miesiąc: match ? monthLabel(match.month) : "",
			Status: match ? match.kind === "suggested" ? "do weryfikacji" : match.amountIssue === "ok" ? "ok" : match.amountIssue : "nierozpoznany",
			Pewność: match ? Math.round(match.confidence * 100) : "",
			Uwagi: match?.reasons.join("; ") ?? ""
		};
	});
	const wb = utils.book_new();
	const ewidencja = utils.aoa_to_sheet([headers, ...listRows]);
	utils.book_append_sheet(wb, ewidencja, "Ewidencja");
	utils.book_append_sheet(wb, utils.json_to_sheet(detailRows), "Wyciąg");
	return wb;
}
function workbookToBlob(wb) {
	const out = writeSync(wb, {
		bookType: "xlsx",
		type: "array"
	});
	return new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
function buildTemplateWorkbook(seasonStartYear) {
	const months = seasonMonths(seasonStartYear);
	const headers = [
		"IMIĘ I NAZWISKO",
		"KWOTA",
		"REGULAMIN",
		...[
			"SENIORZY",
			"SENIORZY II",
			"TANIEC SENIORZY"
		],
		...months.map(monthHeader)
	];
	const sample = [[
		"Zajk Paweł",
		210,
		false,
		true,
		false,
		false,
		...months.map(() => false)
	], [
		"Zajk Julia",
		220,
		false,
		false,
		true,
		false,
		...months.map(() => false)
	]];
	const ws = utils.aoa_to_sheet([headers, ...sample]);
	const wb = utils.book_new();
	utils.book_append_sheet(wb, ws, "Ewidencja");
	return wb;
}
function UczestnicyPage() {
	const participants = useValdek((s) => s.participants);
	const groups = useValdek((s) => s.groups);
	const matches = useValdek((s) => s.matches);
	const transfers = useValdek((s) => s.transfers);
	const manual = useValdek((s) => s.manual);
	const selectedMonth = useValdek((s) => s.selectedMonth);
	const seasonStartYear = useValdek((s) => s.seasonStartYear);
	const updateParticipant = useValdek((s) => s.updateParticipant);
	const removeParticipant = useValdek((s) => s.removeParticipant);
	const setManual = useValdek((s) => s.setManual);
	const resetAll = useValdek((s) => s.resetAll);
	const seedDemo = useValdek((s) => s.seedDemo);
	const [query, setQuery] = (0, import_react.useState)("");
	const [groupId, setGroupId] = (0, import_react.useState)("all");
	const [editing, setEditing] = (0, import_react.useState)(void 0);
	const [excelFile, setExcelFile] = (0, import_react.useState)(null);
	const months = seasonMonths(seasonStartYear);
	const filtered = (0, import_react.useMemo)(() => {
		const q = normalizeText(query);
		return participants.filter((p) => {
			if (groupId !== "all" && p.groupId !== groupId) return false;
			if (!q) return true;
			const g = groups.find((x) => x.id === p.groupId)?.name ?? "";
			return normalizeText(`${p.firstName} ${p.lastName} ${g} ${p.notes}`).includes(q);
		});
	}, [
		participants,
		query,
		groupId,
		groups
	]);
	const exportList = () => {
		const wb = buildWorkbook({
			seasonStartYear,
			groups,
			participants,
			matches,
			transfers
		});
		downloadBlob(workbookToBlob(wb), `valdek-uczestnicy-${selectedMonth}.xlsx`);
		toast.success("Zapisano Excel na komputerze");
	};
	const exportTemplate = () => {
		downloadBlob(workbookToBlob(buildTemplateWorkbook(seasonStartYear)), "valdek-szablon.xlsx");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl flex-col gap-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
							children: "Lista"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display mt-1 text-4xl",
							children: "Uczestnicy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm text-muted-foreground",
							children: "To ta sama ewidencja co w Excelu: „Zajk Julia”, stawka, grupy jako kolumny TAK/NIE, miesiące. Tu zmieniasz stawki i oznaczenia — eksport wraca do tego układu."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: exportTemplate,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Szablon"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: exportList,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Eksport"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: ".xlsx,.xls,.csv",
								className: "sr-only",
								onChange: (e) => {
									const f = e.target.files?.[0];
									if (f) setExcelFile(f);
									e.currentTarget.value = "";
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), " Wgraj Excel"] })
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => setEditing(null),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Dodaj osobę"]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "pl-9",
							placeholder: "Szukaj nazwiska albo grupy",
							value: query,
							onChange: (e) => setQuery(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: groupId,
						onValueChange: setGroupId,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "sm:w-56",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "Wszystkie grupy"
						}), groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: g.id,
							children: g.name
						}, g.id))] })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[720px] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border text-xs tracking-wide text-muted-foreground uppercase",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "sticky left-0 bg-card px-4 py-3 font-medium",
									children: "Uczestnik"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Grupa"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Stawka"
								}),
								months.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-3 text-center font-medium",
									children: monthShort(m)
								}, m)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-3 py-3" })
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((p) => {
							const current = monthStatusFor(p, selectedMonth, matches, manual);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/70 last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "sticky left-0 bg-card px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "text-left",
											onClick: () => setEditing(p),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-medium",
												children: fullName(p.firstName, p.lastName)
											}), p.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground",
												children: p.notes
											}) : null]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-muted-foreground",
										children: groups.find((g) => g.id === p.groupId)?.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "h-9 w-20 rounded-sm bg-secondary px-2 tabular",
											value: p.monthlyFee,
											onChange: (e) => updateParticipant(p.id, { monthlyFee: Number(e.target.value.replace(",", ".")) || 0 })
										})
									}),
									months.map((m) => {
										const st = monthStatusFor(p, m, matches, manual);
										const selected = m === selectedMonth;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-1 py-2 text-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												title: `${monthShort(m)} — ${st.status}`,
												onClick: () => {
													if (st.status === "unpaid") setManual(p.id, m, {
														status: "paid",
														amount: p.monthlyFee
													});
													else setManual(p.id, m, null);
												},
												className: `h-9 min-w-9 rounded-sm px-1 text-[11px] tabular ${selected ? "shadow-[var(--shadow-border)]" : ""} ${st.status === "paid" ? "text-paid" : st.status === "unpaid" ? "text-muted-foreground" : "text-warn"}`,
												children: st.status === "paid" ? "tak" : st.status === "unpaid" ? "—" : "?"
											})
										}, m);
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-end gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: current.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												className: "size-9",
												"aria-label": "Usuń",
												onClick: () => removeParticipant(p.id),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
											})]
										})
									})
								]
							}, p.id);
						}) })]
					}), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 py-10 text-center text-sm text-muted-foreground",
						children: "Brak osób na liście."
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						filtered.length,
						" osób · klik w miesiąc oznacza wpłatę ręcznie · ",
						formatPln(filtered.reduce((s, p) => s + p.monthlyFee, 0)),
						" ",
						"należności w widoku"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => seedDemo(),
							children: "Przykładowe dane"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => resetAll(),
							children: "Wyczyść kasę"
						})]
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParticipantDialog, {
			open: editing !== void 0,
			onOpenChange: (o) => {
				if (!o) setEditing(void 0);
			},
			participant: editing ?? void 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcelImportDialog, {
			open: Boolean(excelFile),
			file: excelFile,
			onOpenChange: (o) => {
				if (!o) setExcelFile(null);
			}
		})
	] });
}
//#endregion
export { UczestnicyPage as component };
