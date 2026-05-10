import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function BudgetBar({ summary }) {
    const cap = summary.totalBudgetCapUsd;
    const spent = summary.totalSpentUsd;
    const pct = cap !== null && cap > 0 ? Math.min(100, spent / cap * 100) : spent > 0 ? 100 : 0;
    return /*#__PURE__*/ _jsxs("div", {
        className: "space-y-2",
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "flex justify-between text-sm text-gray-700",
                children: [
                    /*#__PURE__*/ _jsx("span", {
                        children: "Spent"
                    }),
                    /*#__PURE__*/ _jsxs("span", {
                        className: "font-medium",
                        children: [
                            "$",
                            spent.toFixed(0),
                            cap !== null ? ` / $${cap.toFixed(0)}` : ""
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("div", {
                className: "h-3 overflow-hidden rounded-full bg-gray-200",
                role: "progressbar",
                "aria-valuenow": Math.round(pct),
                "aria-valuemin": 0,
                "aria-valuemax": 100,
                "aria-label": "Budget usage",
                children: /*#__PURE__*/ _jsx("div", {
                    className: `h-full rounded-full transition-all ${summary.isOverBudget ? "bg-red-500" : "bg-teal"}`,
                    style: {
                        width: `${pct}%`
                    }
                })
            }),
            summary.remainingUsd !== null ? /*#__PURE__*/ _jsxs("p", {
                className: "text-sm text-gray-600",
                children: [
                    "Remaining: $",
                    summary.remainingUsd.toFixed(0)
                ]
            }) : null
        ]
    });
}
