import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function DayLevelTable({ rows }) {
    return /*#__PURE__*/ _jsx("div", {
        className: "overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700",
        children: /*#__PURE__*/ _jsxs("table", {
            className: "min-w-full divide-y divide-gray-200 text-sm dark:divide-slate-700",
            children: [
                /*#__PURE__*/ _jsx("thead", {
                    className: "bg-gray-50 dark:bg-slate-900",
                    children: /*#__PURE__*/ _jsxs("tr", {
                        children: [
                            /*#__PURE__*/ _jsx("th", {
                                scope: "col",
                                className: "px-4 py-2 text-left font-medium text-gray-700",
                                children: "Date"
                            }),
                            /*#__PURE__*/ _jsx("th", {
                                scope: "col",
                                className: "px-4 py-2 text-left font-medium text-gray-700",
                                children: "City"
                            }),
                            /*#__PURE__*/ _jsx("th", {
                                scope: "col",
                                className: "px-4 py-2 text-right font-medium text-gray-700",
                                children: "Stay"
                            }),
                            /*#__PURE__*/ _jsx("th", {
                                scope: "col",
                                className: "px-4 py-2 text-right font-medium text-gray-700",
                                children: "Activities"
                            }),
                            /*#__PURE__*/ _jsx("th", {
                                scope: "col",
                                className: "px-4 py-2 text-right font-medium text-gray-700",
                                children: "Total"
                            })
                        ]
                    })
                }),
                /*#__PURE__*/ _jsx("tbody", {
                    className: "divide-y divide-gray-100 bg-white dark:divide-slate-800 dark:bg-slate-950",
                    children: rows.map((r)=>/*#__PURE__*/ _jsxs("tr", {
                            children: [
                                /*#__PURE__*/ _jsx("td", {
                                    className: "px-4 py-2",
                                    children: r.date
                                }),
                                /*#__PURE__*/ _jsx("td", {
                                    className: "px-4 py-2",
                                    children: r.cityName
                                }),
                                /*#__PURE__*/ _jsxs("td", {
                                    className: "px-4 py-2 text-right",
                                    children: [
                                        "$",
                                        r.accommodationCostUsd.toFixed(0)
                                    ]
                                }),
                                /*#__PURE__*/ _jsxs("td", {
                                    className: "px-4 py-2 text-right",
                                    children: [
                                        "$",
                                        r.activitiesCostUsd.toFixed(0)
                                    ]
                                }),
                                /*#__PURE__*/ _jsxs("td", {
                                    className: "px-4 py-2 text-right font-medium",
                                    children: [
                                        "$",
                                        r.totalUsd.toFixed(0)
                                    ]
                                })
                            ]
                        }, `${r.stopId}-${r.date}`))
                })
            ]
        })
    });
}
