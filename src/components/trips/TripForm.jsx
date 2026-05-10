import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
export const TRIP_TYPE_VALUES = [
    "solo",
    "couple",
    "family",
    "group",
    "adventure",
    "pilgrimage",
    "honeymoon",
    "business"
];
const VIBE_VALUES = [
    "backpacker",
    "comfort",
    "luxury"
];
const schema = z.object({
    title: z.string().min(1, "Title is required"),
    startDate: z.string().min(1, "Start date required"),
    endDate: z.string().min(1, "End date required"),
    tripType: z.enum(TRIP_TYPE_VALUES),
    vibe: z.enum(VIBE_VALUES).optional(),
    budgetCapUsd: z.preprocess((val)=>{
        if (val === "" || val === undefined || val === null) return undefined;
        const n = Number(val);
        return Number.isFinite(n) ? n : undefined;
    }, z.number().positive().optional())
});
export function TripForm({ defaultValues, onSubmit, submitLabel = "Save trip", isSubmitting = false }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            startDate: "",
            endDate: "",
            tripType: "solo",
            vibe: "comfort",
            ...defaultValues
        }
    });
    return /*#__PURE__*/ _jsxs("form", {
        className: "flex max-w-lg flex-col gap-4",
        onSubmit: handleSubmit(onSubmit),
        noValidate: true,
        children: [
            /*#__PURE__*/ _jsx(Input, {
                id: "trip-title",
                label: "Title",
                ...register("title"),
                error: errors.title?.message
            }),
            /*#__PURE__*/ _jsx(Input, {
                id: "trip-start",
                label: "Start date",
                type: "date",
                ...register("startDate"),
                error: errors.startDate?.message
            }),
            /*#__PURE__*/ _jsx(Input, {
                id: "trip-end",
                label: "End date",
                type: "date",
                ...register("endDate"),
                error: errors.endDate?.message
            }),
            /*#__PURE__*/ _jsx(Select, {
                id: "trip-type",
                label: "Trip type",
                ...register("tripType"),
                children: TRIP_TYPE_VALUES.map((t)=>/*#__PURE__*/ _jsx("option", {
                        value: t,
                        children: t
                    }, t))
            }),
            /*#__PURE__*/ _jsx(Select, {
                id: "trip-vibe",
                label: "Budget vibe",
                ...register("vibe"),
                children: VIBE_VALUES.map((v)=>/*#__PURE__*/ _jsx("option", {
                        value: v,
                        children: v
                    }, v))
            }),
            /*#__PURE__*/ _jsx(Input, {
                id: "trip-cap",
                label: "Budget cap (USD)",
                type: "number",
                min: 0,
                step: 1,
                ...register("budgetCapUsd"),
                error: errors.budgetCapUsd?.message
            }),
            /*#__PURE__*/ _jsx(Button, {
                type: "submit",
                variant: "primary",
                disabled: isSubmitting,
                "aria-busy": isSubmitting,
                children: isSubmitting ? "Saving…" : submitLabel
            })
        ]
    });
}
