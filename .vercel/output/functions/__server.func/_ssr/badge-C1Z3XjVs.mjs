import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as ShieldCheck, f as Menu, h as FileText, m as LayoutDashboard, n as Users, t as X, u as Scale, v as ChevronDown, y as Check } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay, c as DialogTrigger, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as SelectItemIndicator, c as SelectTrigger$1, i as SelectItem$1, l as SelectValue$1, n as SelectContent$1, o as SelectItemText, r as SelectIcon, s as SelectPortal, t as Select$1, u as SelectViewport } from "../_libs/@radix-ui/react-select+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { g as cn, h as seasonMonths, r as useValdek, u as monthLabel } from "./router-1VjxVlmk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-C1Z3XjVs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[var(--shadow-border)]",
			outline: "bg-transparent shadow-[var(--shadow-border)] hover:bg-accent",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			destructive: "bg-destructive text-primary-foreground hover:bg-destructive/90",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 rounded-sm px-3 text-xs",
			lg: "h-12 rounded-lg px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
var SheetPortal = DialogPortal;
var SheetTitle = DialogTitle;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	ref,
	className: cn("fixed inset-0 z-50 bg-background/70", className),
	...props
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var SheetContent = import_react.forwardRef(({ className, children, side = "left", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn("fixed z-50 flex h-full flex-col bg-sidebar p-5 shadow-[var(--shadow-elevated)]", side === "left" ? "top-0 left-0 w-72" : "top-0 right-0 w-72", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
			className: "sr-only",
			children: "Menu"
		}),
		children,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-4 right-4 opacity-70 hover:opacity-100",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Zamknij"
			})]
		})
	]
})] }));
SheetContent.displayName = DialogContent.displayName;
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-6", className),
		...props
	});
}
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-11 w-full items-center justify-between gap-2 rounded-md bg-secondary px-3 text-sm shadow-[var(--shadow-border)] focus:ring-2 focus:ring-ring/70 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 opacity-60" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-72 min-w-32 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-[var(--shadow-elevated)]", position === "popper" && "data-[side=bottom]:translate-y-1", className),
	position,
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
		className: "p-1",
		children
	})
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-pointer items-center rounded-sm py-2 pr-8 pl-2 text-sm outline-none select-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex size-4 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var NAV = [
	{
		to: "/",
		label: "Pulpit",
		icon: LayoutDashboard
	},
	{
		to: "/uczestnicy",
		label: "Uczestnicy",
		icon: Users
	},
	{
		to: "/wyciag",
		label: "Wyciąg",
		icon: FileText
	},
	{
		to: "/rozliczenie",
		label: "Rozliczenie",
		icon: Scale
	}
];
function Brand() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/",
		className: "flex items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-9 items-center justify-center rounded-md bg-primary font-display text-xl leading-none text-primary-foreground",
			children: "V"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex flex-col leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display text-2xl",
				children: "Valdek"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 text-[11px] tracking-[0.18em] text-muted-foreground uppercase",
				children: "Kasa teatralna"
			})]
		})]
	});
}
function NavLinks({ onNavigate }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-col gap-1",
		children: NAV.map((item) => {
			const active = pathname === item.to;
			const Icon = item.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				onClick: onNavigate,
				className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
			}, item.to);
		})
	});
}
function MonthSelect() {
	const seasonStartYear = useValdek((s) => s.seasonStartYear);
	const selectedMonth = useValdek((s) => s.selectedMonth);
	const setMonth = useValdek((s) => s.setMonth);
	const months = seasonMonths(seasonStartYear);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value: selectedMonth,
		onValueChange: setMonth,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			className: "h-11 w-full min-w-44 md:w-52",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: months.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: m,
			children: monthLabel(m)
		}, m)) })]
	});
}
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex min-h-dvh max-w-[1440px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-sidebar p-5 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "curtain-rule my-6" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-auto rounded-lg bg-secondary p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2 text-xs leading-relaxed text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0" }), "Pliki i wpłaty zostają na tym komputerze. Nic nie wychodzi do sieci."]
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col pb-20 md:pb-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "md:hidden",
								"aria-label": "Menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {})] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "md:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ml-auto flex items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthSelect, {})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 px-4 py-6 md:px-8 md:py-8",
					children
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "fixed right-0 bottom-0 left-0 z-40 grid grid-cols-4 border-t border-border bg-sidebar md:hidden",
			children: NAV.map((item) => {
				const active = pathname === item.to;
				const Icon = item.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[11px]", active ? "text-foreground" : "text-muted-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
				}, item.to);
			})
		})]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
	variants: { variant: {
		default: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
		outline: "shadow-[var(--shadow-border)] text-foreground",
		paid: "bg-paid/15 text-paid",
		unpaid: "bg-unpaid/15 text-unpaid",
		warn: "bg-warn/15 text-warn"
	} },
	defaultVariants: { variant: "secondary" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
export { SelectContent as a, SelectValue as c, Select as i, Badge as n, SelectItem as o, Button as r, SelectTrigger as s, AppShell as t };
