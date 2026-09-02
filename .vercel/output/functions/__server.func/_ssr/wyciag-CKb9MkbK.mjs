import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as FileText, o as Trash2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { f as normalizeText, g as cn, m as parsePln, p as parseLooseDate, r as useValdek, s as DEMO_STATEMENT_LINES, u as monthLabel, v as formatPln, y as uid } from "./router-1VjxVlmk.mjs";
import { n as Badge, r as Button, t as AppShell } from "./badge-C1Z3XjVs.mjs";
import { t as Textarea } from "./textarea-Bv_iCmIv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wyciag-CKb9MkbK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FileDrop({ accept, onFile, children, className, label }) {
	const inputRef = (0, import_react.useRef)(null);
	const [over, setOver] = (0, import_react.useState)(false);
	const onDrop = (e) => {
		e.preventDefault();
		setOver(false);
		const file = e.dataTransfer.files?.[0];
		if (file) onFile(file);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onDragOver: (e) => {
			e.preventDefault();
			setOver(true);
		},
		onDragLeave: () => setOver(false),
		onDrop,
		className: cn("relative flex min-h-44 w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-card px-6 py-8 text-center shadow-[var(--shadow-border)] transition-[background-color,box-shadow] duration-150", over && "bg-accent", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: inputRef,
			type: "file",
			accept,
			"aria-label": label,
			className: "absolute inset-0 z-10 cursor-pointer opacity-0",
			onChange: (e) => {
				const file = e.target.files?.[0];
				if (file) onFile(file);
				e.currentTarget.value = "";
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none",
			children
		})]
	});
}
var AMOUNT_RE = /(?<!\d)(-?\d{1,3}(?:[ .]\d{3})*,\d{2}|-?\d+,\d{2}|-?\d+\.\d{2})(?:\s*(?:PLN|zł|ZL))?/gi;
var DATE_RE = /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-\d{2}-\d{2})/;
var ISO_LINE = /^(20\d{2}-\d{2}-\d{2})\b/;
var OUT_HINTS = [
	"obciazenie",
	"obciażenie",
	"wyplata",
	"wypłata",
	"przelew wychodzacy",
	"oplata za prowadzenie",
	"zakup przy uzyciu karty",
	"zakup e commerce",
	"blik zakup",
	"transakcja nierozliczona"
];
var IN_HINTS = [
	"przychodzacy",
	"przychodzące",
	"wplata",
	"wpłata",
	"uznanie",
	"przelew przychodzacy",
	"przelew wewnetrzny przychodzacy",
	"wplywy"
];
function reconstructLines(items) {
	const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
	const lines = [];
	const yTol = 3.2;
	for (const item of sorted) {
		if (!item.str.trim()) continue;
		const line = lines.find((l) => Math.abs(l.y - item.y) <= yTol);
		if (line) line.parts.push({
			x: item.x,
			str: item.str
		});
		else lines.push({
			y: item.y,
			parts: [{
				x: item.x,
				str: item.str
			}]
		});
	}
	return lines.map((l) => l.parts.sort((a, b) => a.x - b.x).map((p) => p.str).join(" ").replace(/\s+/g, " ").trim());
}
function amountsIn(line) {
	const out = [];
	const re = new RegExp(AMOUNT_RE.source, "gi");
	let m;
	while (m = re.exec(line)) {
		const raw = m[1];
		if (raw.replace(/\D/g, "").length > 8) continue;
		const value = parsePln(raw);
		if (value == null) continue;
		if (Math.abs(value) >= 1e5) continue;
		out.push({
			raw,
			value,
			index: m.index
		});
	}
	return out;
}
function classifyDirection(text, amount) {
	const n = normalizeText(text);
	if (amount < 0 || OUT_HINTS.some((h) => n.includes(normalizeText(h)))) return "out";
	if (IN_HINTS.some((h) => n.includes(normalizeText(h)))) return "in";
	return amount > 0 ? "in" : "unknown";
}
function cleanTransferTitle(block) {
	return block.replace(DATE_RE, " ").replace(AMOUNT_RE, " ").replace(/\bPLN\b|\bzł\b/gi, " ").replace(/\bmKonto Intensive\b/gi, " ").replace(/\b\d{4}\s*\.\.\.\s*\d{4}\b/g, " ").replace(/\b\d{26}\b/g, " ").replace(/\bUL\.?\s*\S.{0,48}?\d{2}-\d{3}\s+\S+/gi, " ").replace(/\bPRZELEW WEWNĘTRZNY PRZYCHODZĄCY\b/gi, " ").replace(/\bPRZELEW WEWNĘTRZNY\b/gi, " ").replace(/\bPRZYCHODZ[ĄA]CY\b/gi, " ").replace(/\btransakcja nierozliczona\b/gi, " ").replace(/\bZAKUP PRZY UŻYCIU KARTY(?:\s*[–-]\s*INTERNET|\s+W KRAJU)?\b/gi, " ").replace(/\bBLIK ZAKUP E-COMMERCE\b/gi, " ").replace(/\b(Wpływy - inne|Wpływy|Wydatki|Zwierzęta|Sport i hobby|Akcesoria i wyposażenie|wyposażenie|Serwis i części|Kategoria|Rachunek)\b/gi, " ").replace(/\s+/g, " ").replace(/^[,.\-–]+|[,.\-–]+$/g, "").replace(/\s+/g, " ").trim();
}
function detectStatementMonth(text) {
	const period = text.match(/za okres od\s+(20\d{2})-(\d{2})-\d{2}/i);
	if (period) return `${period[1]}-${period[2]}`;
	const dotted = text.match(/za okres od\s+(\d{1,2})[./](\d{1,2})[./](20\d{2})/i);
	if (dotted) return `${dotted[3]}-${dotted[2].padStart(2, "0")}`;
	const firstIso = text.match(/\b(20\d{2})-(0[1-9]|1[0-2])-\d{2}\b/);
	if (firstIso) return `${firstIso[1]}-${firstIso[2]}`;
	return null;
}
function looksLikeMbankOrIsoTable(lines) {
	const blob = normalizeText(lines.slice(0, 40).join(" "));
	const isoOps = lines.filter((l) => ISO_LINE.test(l)).length;
	if (blob.includes("mbank") || blob.includes("opis operacji") || blob.includes("mkonto")) return isoOps > 0;
	return isoOps >= 2;
}
function parseIsoTable(lines, statementId) {
	const groups = [];
	for (const line of lines) {
		const m = line.match(ISO_LINE);
		if (m) groups.push({
			date: m[1],
			lines: [line]
		});
		else if (groups.length) {
			const last = groups[groups.length - 1];
			if (/^strona/i.test(line)) continue;
			last.lines.push(line);
		}
	}
	const transfers = [];
	for (const group of groups) {
		const block = group.lines.join(" ");
		const amounts = amountsIn(block).filter((a) => Math.abs(a.value) >= .01);
		if (!amounts.length) continue;
		const amount = amounts[amounts.length - 1].value;
		const title = cleanTransferTitle(block) || "Przelew bez tytułu";
		const direction = classifyDirection(block, amount);
		transfers.push({
			id: uid("tr"),
			statementId,
			date: group.date,
			amount: Math.abs(amount),
			title,
			sender: "",
			raw: block,
			direction,
			ignored: direction === "out"
		});
	}
	return transfers;
}
function parseTransfersFromText(text, statementId) {
	const rawLines = text.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
	if (looksLikeMbankOrIsoTable(rawLines)) return parseIsoTable(rawLines, statementId);
	const transfers = [];
	let buffer = [];
	let currentDate = null;
	const flush = () => {
		if (!buffer.length) return;
		const block = buffer.join(" ");
		const amounts = amountsIn(block);
		const date = currentDate ?? parseLooseDate(block);
		const meaningful = amounts.filter((a) => Math.abs(a.value) >= 1 && Math.abs(a.value) < 1e5);
		if (!date || !meaningful.length) {
			buffer = [];
			return;
		}
		const amount = meaningful[meaningful.length - 1].value;
		const title = cleanTransferTitle(block) || "Przelew bez tytułu";
		const direction = classifyDirection(block, amount);
		transfers.push({
			id: uid("tr"),
			statementId,
			date,
			amount: Math.abs(amount),
			title,
			sender: "",
			raw: block,
			direction,
			ignored: direction === "out"
		});
		buffer = [];
	};
	for (const line of rawLines) {
		const date = parseLooseDate(line);
		const hasAmount = amountsIn(line).length > 0;
		const startsWithDate = /^(20\d{2}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/.test(line);
		if (date && (hasAmount || startsWithDate)) {
			flush();
			currentDate = date;
			buffer = [line];
			if (hasAmount) flush();
			continue;
		}
		if (buffer.length) {
			buffer.push(line);
			if (hasAmount) flush();
		}
	}
	flush();
	if (transfers.filter((t) => t.direction === "in").length === 0) {
		for (const t of transfers) if (t.direction === "unknown") t.direction = "in";
	}
	return transfers;
}
async function loadPdfjs() {
	const pdfjs = await import("../_libs/pdfjs-dist.mjs").then((n) => n.t);
	const worker = await import("./pdf.worker.min-CA4SejP6.mjs");
	pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
	return pdfjs;
}
async function parseBankPdf(file, fileName, month) {
	const pdfjs = await loadPdfjs();
	const data = file instanceof File ? await file.arrayBuffer() : file instanceof Uint8Array ? file : new Uint8Array(file);
	const doc = await pdfjs.getDocument({
		data,
		useSystemFonts: true
	}).promise;
	const statementId = uid("st");
	const allLines = [];
	for (let i = 1; i <= doc.numPages; i += 1) {
		const items = (await (await doc.getPage(i)).getTextContent()).items.map((item) => {
			if (!("str" in item) || !("transform" in item)) return null;
			const transform = item.transform;
			return {
				str: String(item.str),
				x: transform[4] ?? 0,
				y: transform[5] ?? 0
			};
		}).filter((x) => x != null);
		allLines.push(...reconstructLines(items));
	}
	const text = allLines.join("\n");
	const transfers = parseTransfersFromText(text, statementId);
	const detectedMonth = detectStatementMonth(text) ?? month;
	const incoming = transfers.filter((t) => t.direction !== "out" && !t.ignored);
	const warning = text.replace(/\s/g, "").length < 40 ? "Ten PDF wygląda na skan bez warstwy tekstu. Poproś bank o PDF z tekstem albo wklej historię ręcznie." : transfers.length === 0 ? "Nie udało się rozpoznać przelewów. Sprawdź, czy to wyciąg z operacjami, albo wklej tekst." : incoming.length === 0 && transfers.length > 0 ? "Na wyciągu są głównie wydatki. Wpłaty przychodzące Valdek weźmie do rozliczenia, zakupy kartą pomija." : void 0;
	return {
		statement: {
			id: statementId,
			fileName,
			month: detectedMonth,
			importedAt: (/* @__PURE__ */ new Date()).toISOString(),
			transferCount: incoming.length,
			warning
		},
		transfers,
		text
	};
}
function buildSamplePdf(lines) {
	const leading = 12;
	const commands = [
		"BT",
		"/F1 9 Tf",
		"36 800 Td"
	];
	lines.forEach((line, i) => {
		const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
		if (i === 0) commands.push(`(${escaped}) Tj`);
		else commands.push(`0 -${leading} Td (${escaped}) Tj`);
	});
	commands.push("ET");
	const stream = commands.join("\n");
	const objects = [
		"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
		"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
		"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
		`4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
		"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj"
	];
	let body = "%PDF-1.4\n";
	const offsets = [0];
	for (const obj of objects) {
		offsets.push(body.length);
		body += `${obj}\n`;
	}
	const xrefStart = body.length;
	let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	for (let i = 1; i <= objects.length; i += 1) xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
	body += `${xref}trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
	return new TextEncoder().encode(body);
}
function WyciagPage() {
	const selectedMonth = useValdek((s) => s.selectedMonth);
	const statements = useValdek((s) => s.statements);
	const transfers = useValdek((s) => s.transfers);
	const matches = useValdek((s) => s.matches);
	const addStatement = useValdek((s) => s.addStatement);
	const removeStatement = useValdek((s) => s.removeStatement);
	const ignoreTransfer = useValdek((s) => s.ignoreTransfer);
	const updateTransfer = useValdek((s) => s.updateTransfer);
	const navigate = useNavigate();
	const [paste, setPaste] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [showSpend, setShowSpend] = (0, import_react.useState)(false);
	const ingest = (statement, nextTransfers) => {
		addStatement(statement, nextTransfers);
		const incoming = nextTransfers.filter((t) => t.direction !== "out" && !t.ignored).length;
		const skipped = nextTransfers.length - incoming;
		toast.success(skipped > 0 ? `Wczytano ${incoming} wpłat, pominięto ${skipped} wydatków kartą` : `Wczytano ${incoming} wpłat`);
		navigate({ to: "/rozliczenie" });
	};
	const onPdf = async (file) => {
		setBusy(true);
		try {
			const result = await parseBankPdf(file, file.name, selectedMonth);
			if (result.statement.warning) toast.message(result.statement.warning);
			ingest(result.statement, result.transfers);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Nie udało się odczytać PDF");
		} finally {
			setBusy(false);
		}
	};
	const onPaste = () => {
		const statementId = uid("st");
		const next = parseTransfersFromText(paste, statementId);
		ingest({
			id: statementId,
			fileName: "wklejony-tekst.txt",
			month: selectedMonth,
			importedAt: (/* @__PURE__ */ new Date()).toISOString(),
			transferCount: next.filter((t) => t.direction !== "out" && !t.ignored).length
		}, next);
	};
	const loadSample = async () => {
		setBusy(true);
		try {
			const result = await parseBankPdf(buildSamplePdf(DEMO_STATEMENT_LINES), "przyklad-lista-operacji.pdf", selectedMonth);
			ingest(result.statement, result.transfers);
		} catch {
			const statementId = uid("st");
			const next = parseTransfersFromText(DEMO_STATEMENT_LINES.join("\n"), statementId);
			ingest({
				id: statementId,
				fileName: "przyklad-lista-operacji.pdf",
				month: selectedMonth,
				importedAt: (/* @__PURE__ */ new Date()).toISOString(),
				transferCount: next.filter((t) => t.direction !== "out" && !t.ignored).length
			}, next);
		} finally {
			setBusy(false);
		}
	};
	const visible = showSpend ? transfers : transfers.filter((t) => !t.ignored && t.direction !== "out");
	const hiddenSpend = transfers.length - transfers.filter((t) => !t.ignored && t.direction !== "out").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-6xl flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted-foreground uppercase",
					children: "Bank"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-1 text-4xl",
					children: "Wyciąg"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted-foreground",
					children: [
						"Lista operacji mBanku za ",
						monthLabel(selectedMonth),
						" — ta z kolumnami data, opis, kategoria, kwota. Wpłaty przychodzące idą do rozliczenia, zakupy kartą i BLIK Valdek odkłada na bok. Parsowanie tylko w tej przeglądarce."
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FileDrop, {
					accept: "application/pdf,.pdf",
					onFile: onPdf,
					label: "Wgraj PDF z wyciągiem",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mb-3 size-6 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-2xl",
							children: busy ? "Czytam wyciąg…" : "Upuść PDF"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-sm text-sm text-muted-foreground",
							children: "Eksport „Lista operacji” z mBanku albo inny PDF z datą, kwotą i tytułem."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: "Wklej historię"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 mb-3 text-sm text-muted-foreground",
							children: "Gdy PDF jest skanem, skopiuj operacje z bankowości."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: paste,
							onChange: (e) => setPaste(e.target.value),
							placeholder: "2026-09-02  JULIA ZAJK SENIORZY WRZESIEŃ  10,00 PLN"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: onPaste,
								disabled: !paste.trim(),
								children: "Wczytaj tekst"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: loadSample,
								disabled: busy,
								children: "Przykładowy wyciąg mBank"
							})]
						})
					]
				})]
			}),
			statements.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Wczytane pliki"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2",
					children: statements.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: s.fileName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								s.transferCount,
								" wpłat · ",
								monthLabel(s.month),
								s.warning ? ` · ${s.warning}` : ""
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Usuń wyciąg",
							onClick: () => removeStatement(s.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})]
					}, s.id))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 px-4 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Operacje"
						}), hiddenSpend > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => setShowSpend((v) => !v),
							children: showSpend ? "Ukryj wydatki kartą" : `Pokaż wydatki kartą (${hiddenSpend})`
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[640px] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border text-xs tracking-wide text-muted-foreground uppercase",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Data"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Kwota"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Tytuł"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Status"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visible.map((t) => {
							const match = matches.find((m) => m.transferId === t.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/70 last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 tabular text-muted-foreground",
										children: t.date
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 tabular",
										children: formatPln(t.amount)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "h-9 w-full min-w-48 rounded-sm bg-transparent px-1",
											value: t.title,
											onChange: (e) => updateTransfer(t.id, { title: e.target.value })
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [t.ignored ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												children: "pominięty"
											}) : match ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: match.kind === "suggested" ? "warn" : "paid",
												children: match.kind === "suggested" ? "do weryfikacji" : "dopasowany"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "unpaid",
												children: "nierozpoznany"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => ignoreTransfer(t.id, !t.ignored),
												children: t.ignored ? "Przywróć" : "Pomiń"
											})]
										})
									})
								]
							}, t.id);
						}) })]
					}),
					visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 py-10 text-center text-sm text-muted-foreground",
						children: "Jeszcze nie ma wpłat za ten sezon."
					}) : null
				]
			})
		]
	}) });
}
//#endregion
export { WyciagPage as component };
