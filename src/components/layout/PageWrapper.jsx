import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
export function PageWrapper() {
    return /*#__PURE__*/ _jsx("main", {
        className: "min-h-screen",
        children: /*#__PURE__*/ _jsx(Outlet, {})
    });
}
