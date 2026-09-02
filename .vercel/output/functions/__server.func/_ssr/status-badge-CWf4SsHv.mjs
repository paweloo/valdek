import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as receivedFor } from "./router-1VjxVlmk.mjs";
import { n as Badge } from "./badge-C1Z3XjVs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-badge-CWf4SsHv.js
var import_jsx_runtime = require_jsx_runtime();
/** Suggested matches wait for a human; anything else with a match is already booked. */
function bucketForMatches(related) {
	if (related.length === 0) return "unmatched";
	if (related.some((m) => m.kind === "suggested")) return "review";
	return "booked";
}
function monthStatusFor(participant, month, matches, manual) {
	const expected = participant.monthlyFee;
	const mark = manual[participant.id]?.[month];
	const received = receivedFor(participant.id, month, matches);
	if (mark?.status === "paid") return {
		status: "paid",
		received: mark.amount ?? received ?? expected,
		expected
	};
	if (mark?.status === "unpaid") return {
		status: "unpaid",
		received: 0,
		expected
	};
	if (mark?.status === "partial") return {
		status: "partial",
		received: mark.amount ?? received,
		expected
	};
	if (received <= 0) return {
		status: "unpaid",
		received,
		expected
	};
	if (matches.filter((m) => m.participantId === participant.id && m.month === month).some((m) => m.kind === "suggested")) return {
		status: "review",
		received,
		expected
	};
	if (Math.abs(received - expected) <= 1) return {
		status: "paid",
		received,
		expected
	};
	if (received < expected) return {
		status: "partial",
		received,
		expected
	};
	return {
		status: "over",
		received,
		expected
	};
}
var STATUS_LABEL = {
	paid: "opłacone",
	partial: "częściowo",
	over: "nadpłata",
	unpaid: "brak wpłaty",
	review: "do weryfikacji"
};
var VARIANT = {
	paid: "paid",
	unpaid: "unpaid",
	partial: "warn",
	over: "warn",
	review: "secondary"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: VARIANT[status],
		children: STATUS_LABEL[status]
	});
}
//#endregion
export { bucketForMatches as n, monthStatusFor as r, StatusBadge as t };
