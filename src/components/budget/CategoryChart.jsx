import { jsx as _jsx } from "react/jsx-runtime";
import { memo, useMemo } from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
ChartJS.register(ArcElement, Tooltip, Legend);
/** Playbook §3.13 — register only used Chart.js modules */ export const CategoryChart = /*#__PURE__*/ memo(function CategoryChart({ categories }) {
    const data = useMemo(()=>{
        return {
            labels: categories.map((c)=>c.category),
            datasets: [
                {
                    data: categories.map((c)=>c.totalUsd),
                    backgroundColor: [
                        "#1B3A6B",
                        "#0D7680",
                        "#D97706",
                        "#2E5BAF",
                        "#14A8B5",
                        "#64748b"
                    ],
                    borderWidth: 1
                }
            ]
        };
    }, [
        categories
    ]);
    if (!categories.length) {
        return /*#__PURE__*/ _jsx("p", {
            className: "text-sm text-gray-600",
            children: "No category breakdown yet."
        });
    }
    return /*#__PURE__*/ _jsx("div", {
        className: "mx-auto max-w-md",
        children: /*#__PURE__*/ _jsx(Doughnut, {
            data: data,
            options: {
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        })
    });
});
