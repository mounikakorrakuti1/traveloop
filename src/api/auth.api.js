import { apiClient, unwrap } from "./client";

const BYPASS_AUTH = true; // flip to false once real backend auth is live

const DEMO_USER = {
    id: "local-user",
    email: "demo@traveloop.local",
    name: "Demo Traveler",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    travelerProfile: "solo",
    isAdmin: false,
    createdAt: new Date().toISOString()
};

function bypassUser(body) {
    return {
        ...DEMO_USER,
        email: body?.email || DEMO_USER.email,
        name: body?.name || DEMO_USER.name,
        avatarUrl: body?.avatarUrl || DEMO_USER.avatarUrl,
        travelerProfile: body?.travelerProfile || DEMO_USER.travelerProfile
    };
}

export async function login(body) {
    if (BYPASS_AUTH) return bypassUser(body);
    const res = await apiClient.post(`/auth/login`, body);
    return unwrap(res).user;
}

export async function register(body) {
    if (BYPASS_AUTH) return bypassUser(body);
    const res = await apiClient.post(`/auth/register`, body);
    return unwrap(res).user;
}

export async function logout() {
    if (BYPASS_AUTH) return;
    await apiClient.post(`/auth/logout`);
}

export async function getMe() {
    if (BYPASS_AUTH) return DEMO_USER;
    const res = await apiClient.get(`/auth/me`);
    return unwrap(res);
}

export async function forgotPassword(email) {
    const res = await apiClient.post(`/auth/forgot-password`, {
        email
    });
    return unwrap(res);
}

export async function resetPassword(body) {
    const res = await apiClient.post(`/auth/reset-password`, body);
    return unwrap(res);
}
