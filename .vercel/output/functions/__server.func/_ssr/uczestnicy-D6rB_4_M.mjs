import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as Search, g as Download, o as Trash2, r as Upload, t as X, u as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as interpretExcelRow, c as b64ToBuffer, d as formatPln, g as normalizeText, h as monthShort, i as guessMapping, l as cn, o as readSpreadsheet, p as fullName, r as useValdek, u as downloadBlob, y as seasonMonths } from "./router-DrK5C4N1.mjs";
import { a as DialogOverlay, i as DialogDescription$1, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as SelectContent, c as SelectValue, i as Select, o as SelectItem, r as Button, s as SelectTrigger, t as AppShell } from "./badge-DXSOSOLP.mjs";
import { r as monthStatusFor, t as StatusBadge } from "./status-badge-C0aCtrf5.mjs";
import { t as Input } from "./input-E-zz1FvB.mjs";
import { t as Textarea } from "./textarea-_Wu-gvR0.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { t as require_lib } from "../_libs/jszip+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/uczestnicy-D6rB_4_M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
var Dialog = Dialog$1;
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-foreground/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-[var(--shadow-border)]", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			className: "absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100",
			"aria-label": "Zamknij",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 flex flex-col gap-1", className),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mt-6 flex justify-end gap-2", className),
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
	className: cn("text-sm font-medium", className),
	...props
}));
Label.displayName = Root.displayName;
var NONE = "__none__";
function ExcelImportDialog({ open, onOpenChange, file }) {
	const seasonStartYear = useValdek((s) => s.seasonStartYear);
	const seedBanner = useValdek((s) => s.seedBanner);
	const importRows = useValdek((s) => s.importRows);
	const setSourceWorkbook = useValdek((s) => s.setSourceWorkbook);
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
	const apply = async () => {
		const count = importRows(rows, mapping, mode);
		if (file) {
			const buf = await file.arrayBuffer();
			if (/\.xlsx$/i.test(file.name)) setSourceWorkbook(buf, file.name);
		}
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Mapowanie kolumn" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Valdek czyta listę z grupami jako kolumny TAK/NIE i miesiącami. Przy eksporcie wraca do tego samego pliku — checkboxy i style zostają." })] }),
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
					onClick: () => void apply(),
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
								onValueChange: setGroupId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: g.id,
									children: g.name
								}, g.id)) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "albo nowa grupa…",
								value: newGroup,
								onChange: (e) => setNewGroup(e.target.value)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "fee",
							children: "Stawka miesięczna"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "fee",
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
var XML_ESCAPE = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;"
};
function escapeXml(s) {
	return s.replace(/[&<>"]/g, (ch) => XML_ESCAPE[ch] ?? ch);
}
function unescapeXml(s) {
	const amp = String.fromCharCode(38);
	return s.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", "\"").replaceAll("&apos;", "'").replaceAll("&amp;", amp);
}
function colLetter(index) {
	let n = index + 1;
	let s = "";
	while (n > 0) {
		const rem = (n - 1) % 26;
		s = String.fromCharCode(65 + rem) + s;
		n = Math.floor((n - 1) / 26);
	}
	return s;
}
function colIndex(letters) {
	let n = 0;
	for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
	return n - 1;
}
function parseRows(sheetXml) {
	const rows = [];
	const re = /<row r="(\d+)"[^>]*>[\s\S]*?<\/row>/g;
	let m;
	while (m = re.exec(sheetXml)) rows.push({
		num: Number(m[1]),
		xml: m[0]
	});
	return rows;
}
function cellXml(rowXml, ref) {
	const re = new RegExp(`<c r="${ref}"[^/]*/>|<c r="${ref}"[^>]*>[\\s\\S]*?</c>`);
	return rowXml.match(re)?.[0] ?? "";
}
function cellStyle(rowXml, ref, fallback) {
	return cellXml(rowXml, ref).match(/\ss="(\d+)"/)?.[1] ?? fallback;
}
function replaceCell(rowXml, ref, next) {
	const re = new RegExp(`<c r="${ref}"[^/]*/>|<c r="${ref}"[^>]*>[\\s\\S]*?</c>`);
	if (re.test(rowXml)) return rowXml.replace(re, next);
	return rowXml.replace("</row>", `${next}</row>`);
}
function checkboxStyle(sheetXml) {
	return (sheetXml.match(/<c r="[A-Z]+\d+"[^>]*\bs="(\d+)"[^>]*\bt="b"/) ?? sheetXml.match(/<c r="[A-Z]+\d+"[^>]*\bt="b"[^>]*\bs="(\d+)"/))?.[1] ?? "14";
}
function setNameCell(rowXml, col, row, name, strings) {
	const ref = `${colLetter(col)}${row}`;
	if (cellText(rowXml, col, row, strings) === name) return rowXml;
	return replaceCell(rowXml, ref, `<c r="${ref}" s="${cellStyle(rowXml, ref, "9")}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(name)}</t></is></c>`);
}
function setNumberCell(rowXml, col, row, value) {
	const ref = `${colLetter(col)}${row}`;
	const existing = cellXml(rowXml, ref);
	if (existing && /<v>/.test(existing) && !/\bt="b"/.test(existing) && !/\bt="s"/.test(existing) && !/\bt="inlineStr"/.test(existing)) {
		if (Number(existing.match(/<v>([\s\S]*?)<\/v>/)?.[1]) === value) return rowXml;
		return replaceCell(rowXml, ref, existing.replace(/<v>[\s\S]*?<\/v>/, `<v>${value}</v>`));
	}
	return replaceCell(rowXml, ref, `<c r="${ref}" s="${cellStyle(rowXml, ref, "11")}"><v>${value}</v></c>`);
}
function setBoolCell(rowXml, col, row, value, style) {
	const ref = `${colLetter(col)}${row}`;
	const existing = cellXml(rowXml, ref);
	const v = value ? "1" : "0";
	if (existing && /\bt="b"/.test(existing)) {
		if (existing.includes(`<v>${v}</v>`)) return rowXml;
		if (/<v>/.test(existing)) return replaceCell(rowXml, ref, existing.replace(/<v>[\s\S]*?<\/v>/, `<v>${v}</v>`));
		return replaceCell(rowXml, ref, existing.replace(/\/>$/, `><v>${v}</v></c>`).replace(/<c /, `<c t="b" `));
	}
	return replaceCell(rowXml, ref, `<c r="${ref}" s="${cellStyle(rowXml, ref, style)}" t="b"><v>${v}</v></c>`);
}
function readSharedStrings(xml) {
	const out = [];
	const re = /<si>([\s\S]*?)<\/si>/g;
	let m;
	while (m = re.exec(xml)) {
		const texts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => unescapeXml(x[1] ?? ""));
		out.push(texts.join(""));
	}
	return out;
}
function cellText(rowXml, col, row, strings) {
	const xml = cellXml(rowXml, `${colLetter(col)}${row}`);
	if (!xml) return "";
	if (/\bt="inlineStr"/.test(xml)) return [...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => unescapeXml(x[1] ?? "")).join("");
	const v = xml.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "";
	if (/\bt="s"/.test(xml)) return strings[Number(v)] ?? "";
	if (/\bt="b"/.test(xml)) return v === "1" ? "TRUE" : "FALSE";
	return v;
}
function maxColInRow(rowXml, row) {
	let max = 0;
	const re = new RegExp(`r="([A-Z]+)${row}"`, "g");
	let m;
	while (m = re.exec(rowXml)) max = Math.max(max, colIndex(m[1]));
	return max;
}
function groupFlagOn(personGroupName, flagName) {
	const wanted = normalizeText(flagName);
	return personGroupName.split(/\s*\+\s*/).map((part) => normalizeText(part)).some((part) => part === wanted);
}
function applyPerson(rowXml, rowNum, person, mapping, strings, boolStyle) {
	let xml = rowXml;
	const nameCol = mapping.fullName ?? 0;
	xml = setNameCell(xml, nameCol, rowNum, person.lastFirst, strings);
	if (mapping.fee != null) xml = setNumberCell(xml, mapping.fee, rowNum, person.fee);
	for (const flag of mapping.groupFlags ?? []) xml = setBoolCell(xml, flag.column, rowNum, groupFlagOn(person.groupName, flag.name), boolStyle);
	for (const [month, col] of Object.entries(mapping.months)) xml = setBoolCell(xml, col, rowNum, Boolean(person.monthsPaid[month]), boolStyle);
	return xml;
}
function clearPerson(rowXml, rowNum, mapping, boolStyle) {
	let xml = rowXml;
	const ref = `${colLetter(mapping.fullName ?? 0)}${rowNum}`;
	const s = cellStyle(xml, ref, "6");
	xml = replaceCell(xml, ref, `<c r="${ref}" s="${s}"/>`);
	if (mapping.fee != null) {
		const fref = `${colLetter(mapping.fee)}${rowNum}`;
		xml = replaceCell(xml, fref, `<c r="${fref}" s="${cellStyle(xml, fref, "13")}"/>`);
	}
	for (const flag of mapping.groupFlags ?? []) xml = setBoolCell(xml, flag.column, rowNum, false, boolStyle);
	for (const col of Object.values(mapping.months)) xml = setBoolCell(xml, col, rowNum, false, boolStyle);
	return xml;
}
function retargetRow(xml, from, to) {
	return xml.replace(new RegExp(`(<row r=")${from}"`), `$1${to}"`).replace(new RegExp(`r="([A-Z]+)${from}"`, "g"), `r="$1${to}"`);
}
function matrixFromSheet(sheetXml, strings) {
	const xmlRows = parseRows(sheetXml);
	let maxCol = 0;
	for (const r of xmlRows) maxCol = Math.max(maxCol, maxColInRow(r.xml, r.num));
	const nonempty = xmlRows.map((r) => ({
		num: r.num,
		xml: r.xml,
		cells: Array.from({ length: maxCol + 1 }, (_, c) => cellText(r.xml, c, r.num, strings))
	})).filter((line) => line.cells.some((c) => c.trim().length > 0));
	const headerLine = nonempty[0];
	if (!headerLine) throw new Error("Brak wiersza nagłówków w arkuszu.");
	const dataLines = nonempty.filter((line) => line.num > headerLine.num);
	return {
		maxCol,
		xmlRows,
		headerLine,
		dataLines,
		headers: headerLine.cells,
		rows: dataLines.map((line) => line.cells)
	};
}
async function sheetPathFor(zip) {
	const workbook = await zip.file("xl/workbook.xml")?.async("string");
	const rels = await zip.file("xl/_rels/workbook.xml.rels")?.async("string");
	if (workbook && rels) {
		const sheets = [...workbook.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?>/g)];
		const relMap = new Map([...rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"|Target="([^"]+)"[^>]*Id="([^"]+)"/g)].map((m) => [m[1] ?? m[4] ?? "", m[2] ?? m[3] ?? ""]));
		const preferred = sheets.find((s) => normalizeText(s[1] ?? "") === "ewidencja") ?? sheets.find((s) => /ewidenc/i.test(s[1] ?? "")) ?? sheets[0];
		if (preferred) {
			let target = relMap.get(preferred[2] ?? "") ?? "worksheets/sheet1.xml";
			if (target.startsWith("/")) target = target.slice(1);
			if (!target.startsWith("xl/")) target = `xl/${target}`;
			if (zip.file(target)) return target;
		}
	}
	const fallback = Object.keys(zip.files).find((p) => /xl\/worksheets\/sheet\d+\.xml$/.test(p));
	if (!fallback) throw new Error("Brak arkusza w pliku Excel.");
	return fallback;
}
async function patchEwidencjaWorkbook(source, people, seasonYear) {
	const bytes = source instanceof Uint8Array ? source : new Uint8Array(source);
	const zip = await import_lib.default.loadAsync(bytes);
	const sheetPath = await sheetPathFor(zip);
	const sheetXml = await zip.file(sheetPath).async("string");
	const sstFile = zip.file("xl/sharedStrings.xml");
	const strings = sstFile ? readSharedStrings(await sstFile.async("string")) : [];
	const boolStyle = checkboxStyle(sheetXml);
	const parsed = matrixFromSheet(sheetXml, strings);
	const mapping = guessMapping(parsed.headers, seasonYear, parsed.rows);
	const nameCol = mapping.fullName ?? 0;
	const xmlRows = parsed.xmlRows;
	const dataRows = parsed.dataLines.filter((r) => (r.cells[nameCol] ?? "").trim().length > 0);
	const checkboxRow = xmlRows.find((r) => /t="b"/.test(r.xml));
	const template = dataRows[0] ?? checkboxRow ?? xmlRows.find((r) => r.num > parsed.headerLine.num);
	if (!template) throw new Error("Nie umiem znaleźć wiersza z uczestnikiem do skopiowania.");
	const dataStart = template.num;
	const used = /* @__PURE__ */ new Set();
	const replacements = /* @__PURE__ */ new Map();
	const extraRows = [];
	for (const person of people) {
		const key = normalizeText(person.lastFirst);
		const existing = dataRows.find((r) => !used.has(r.num) && normalizeText(r.cells[nameCol] ?? "") === key);
		if (existing) {
			used.add(existing.num);
			replacements.set(existing.num, applyPerson(existing.xml, existing.num, person, mapping, strings, boolStyle));
			continue;
		}
		const empty = xmlRows.find((r) => r.num >= dataStart && !used.has(r.num) && !dataRows.some((d) => d.num === r.num));
		const sourceXml = "xml" in template ? template.xml : "";
		const sourceNum = "num" in template ? template.num : 3;
		if (empty) {
			used.add(empty.num);
			const cloned = retargetRow(sourceXml, sourceNum, empty.num);
			replacements.set(empty.num, applyPerson(cloned, empty.num, person, mapping, strings, boolStyle));
			continue;
		}
		const nextNum = Math.max(0, ...xmlRows.map((r) => r.num), ...extraRows.map((r) => r.num)) + 1;
		const applied = applyPerson(retargetRow(sourceXml, sourceNum, nextNum), nextNum, person, mapping, strings, boolStyle);
		extraRows.push({
			num: nextNum,
			xml: applied
		});
		used.add(nextNum);
	}
	for (const row of dataRows) {
		if (used.has(row.num)) continue;
		replacements.set(row.num, clearPerson(row.xml, row.num, mapping, boolStyle));
	}
	let nextSheet = sheetXml;
	for (const row of xmlRows) {
		const updated = replacements.get(row.num);
		if (updated && updated !== row.xml) nextSheet = nextSheet.replace(row.xml, updated);
	}
	if (extraRows.length) {
		const block = extraRows.map((r) => r.xml).join("");
		nextSheet = nextSheet.replace("</sheetData>", `${block}</sheetData>`);
	}
	if (extraRows.length) {
		const maxRow = Math.max(...parseRows(nextSheet).map((r) => r.num));
		const dim = sheetXml.match(/<dimension ref="([A-Z]+\d+):([A-Z]+)\d+"\/>/);
		const start = dim?.[1] ?? "A1";
		const endCol = dim?.[2] ?? colLetter(parsed.maxCol);
		nextSheet = nextSheet.replace(/<dimension ref="[^"]+"\/>/, `<dimension ref="${start}:${endCol}${maxRow}"/>`);
	}
	zip.file(sheetPath, nextSheet);
	return zip.generateAsync({
		type: "blob",
		mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		compression: "DEFLATE"
	});
}
function peopleFromState(params) {
	return params.participants.filter((p) => p.active).map((p) => {
		const group = params.groups.find((g) => g.id === p.groupId)?.name ?? "";
		const monthsPaid = {};
		for (const month of params.seasonMonths) {
			const received = params.matches.filter((m) => m.participantId === p.id && m.month === month && m.kind !== "suggested").reduce((sum, m) => sum + m.amount, 0);
			const mark = params.manual[p.id]?.[month];
			monthsPaid[month] = mark?.status === "paid" || mark?.status === "partial" || received > 0;
		}
		return {
			lastFirst: `${p.lastName} ${p.firstName}`.trim(),
			fee: p.monthlyFee,
			groupName: group,
			monthsPaid
		};
	});
}
function UczestnicyPage() {
	const participants = useValdek((s) => s.participants);
	const groups = useValdek((s) => s.groups);
	const matches = useValdek((s) => s.matches);
	const manual = useValdek((s) => s.manual);
	const selectedMonth = useValdek((s) => s.selectedMonth);
	const seasonStartYear = useValdek((s) => s.seasonStartYear);
	const updateParticipant = useValdek((s) => s.updateParticipant);
	const removeParticipant = useValdek((s) => s.removeParticipant);
	const setManual = useValdek((s) => s.setManual);
	const resetAll = useValdek((s) => s.resetAll);
	const seedDemo = useValdek((s) => s.seedDemo);
	const sourceWorkbookB64 = useValdek((s) => s.sourceWorkbookB64);
	const sourceFileName = useValdek((s) => s.sourceFileName);
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
	const exportList = async () => {
		try {
			let source = sourceWorkbookB64 ? b64ToBuffer(sourceWorkbookB64) : null;
			if (!source) {
				const res = await fetch("/ewidencja-szablon.xlsx");
				if (!res.ok) throw new Error("Brak szablonu ewidencji");
				source = await res.arrayBuffer();
			}
			const people = peopleFromState({
				participants,
				groups,
				matches,
				manual,
				seasonMonths: months
			});
			const blob = await patchEwidencjaWorkbook(source, people, seasonStartYear);
			downloadBlob(blob, sourceFileName || "UCZESTNICY.xlsx");
			toast.success("Zapisano ten sam plik ewidencji — checkboxy i style zostają");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Nie udało się zapisać Excela");
		}
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
							children: "To ta sama ewidencja co w Excelu. Eksport nie robi nowego arkusza — dopisuje stawki i miesiące do wczytanego pliku, z checkboxami i Twoimi stylami."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => void exportList(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Zapisz Excel"]
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
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
							const st = monthStatusFor(p, selectedMonth, matches, manual);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/70 last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "sticky left-0 bg-card px-4 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "text-left font-medium",
											onClick: () => setEditing(p),
											children: fullName(p.firstName, p.lastName)
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-muted-foreground",
										children: groups.find((g) => g.id === p.groupId)?.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "h-9 w-20 rounded-sm bg-transparent px-1 tabular",
											value: p.monthlyFee,
											onChange: (e) => updateParticipant(p.id, { monthlyFee: Number(e.target.value) || 0 })
										})
									}),
									months.map((m) => {
										const cell = monthStatusFor(p, m, matches, manual);
										const mark = cell.status === "paid" || cell.status === "over" ? "paid" : cell.status === "unpaid" ? null : cell.status;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-2 text-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "text-xs text-muted-foreground",
												onClick: () => setManual(p.id, m, mark === "paid" ? { status: "unpaid" } : {
													status: "paid",
													amount: p.monthlyFee
												}),
												children: cell.status === "unpaid" ? "—" : cell.status === "paid" ? "✓" : "?"
											})
										}, m);
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: st.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => removeParticipant(p.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Usuń"]
											})]
										})
									})
								]
							}, p.id);
						}) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							filtered.length,
							" osób · klik w miesiąc oznacza wpłatę ręcznie · ",
							formatPln(filtered.reduce((s, p) => s + p.monthlyFee, 0)),
							" należności w widoku"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => seedDemo(),
							children: "Przykładowe dane"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => resetAll(),
							children: "Wyczyść kasę"
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcelImportDialog, {
			open: Boolean(excelFile),
			onOpenChange: (o) => !o && setExcelFile(null),
			file: excelFile
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParticipantDialog, {
			open: editing !== void 0,
			onOpenChange: (o) => !o && setEditing(void 0),
			participant: editing
		})
	] });
}
//#endregion
export { UczestnicyPage as component };
