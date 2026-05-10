import axios from "axios";
import { useAuthStore } from "@/store/authStore";
function getEnvBaseUrl() {
    const raw = import.meta.env.VITE_API_URL;
    if (typeof raw === "string" && raw.length > 0) return raw.replace(/\/$/, "");
    return "http://localhost:3000";
}
/**
 * Playbook §3.3 — `VITE_API_URL` + `/api/v1`, cookies for HttpOnly JWT.
 */ export const apiClient = axios.create({
    baseURL: `${getEnvBaseUrl()}/api/v1`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});
apiClient.interceptors.response.use((res)=>res, (err)=>{
    if (axios.isAxiosError(err) && err.response?.status === 401) {
        const reqUrl = err.config?.url ?? "";
        /** Bootstrap `GET /auth/me` should not hard-redirect — playbook §3.5 */ const isMeCheck = reqUrl.includes("/auth/me");
        useAuthStore.getState().logout();
        if (!isMeCheck) {
            window.location.href = "/login";
        }
    }
    return Promise.reject(err);
});
export function unwrap(res) {
    return res.data.data;
}
export function unwrapPaginated(res) {
    const meta = res.data.meta;
    if (!meta) throw new Error("Paginated response missing meta");
    return {
        items: res.data.data,
        meta
    };
}
export function isApiErrorBody(value) {
    if (!value || typeof value !== "object") return false;
    const v = value;
    return typeof v.error === "string" && typeof v.code === "string";
}
export function getApiErrorMessage(err) {
    if (!axios.isAxiosError(err)) return "Something went wrong";
    const body = err.response?.data;
    if (isApiErrorBody(body)) return body.error;
    return err.message || "Request failed";
}
export function getRateLimitRetryAfter(err) {
    if (!axios.isAxiosError(err) || err.response?.status !== 429) return null;
    const raw = err.response.headers["retry-after"];
    const headerVal = Array.isArray(raw) ? raw[0] : raw;
    if (!headerVal) return null;
    const n = Number.parseInt(headerVal, 10);
    return Number.isFinite(n) ? n : null;
}
