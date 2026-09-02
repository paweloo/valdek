import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as cn } from "./router-DrK5C4N1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/textarea-_Wu-gvR0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	className: cn("flex min-h-32 w-full rounded-md bg-card px-3 py-2 text-sm shadow-[var(--shadow-border)] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/70", className),
	ref,
	...props
}));
Textarea.displayName = "Textarea";
//#endregion
export { Textarea as t };
