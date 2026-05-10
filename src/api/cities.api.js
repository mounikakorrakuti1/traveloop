import { apiClient, unwrap, unwrapPaginated } from "./client";
export async function searchCities(params) {
    const res = await apiClient.get(`/cities`, {
        params
    });
    const { items, meta } = unwrapPaginated(res);
    return {
        cities: items,
        meta
    };
}
export async function getCityById(id) {
    const res = await apiClient.get(`/cities/${id}`);
    return unwrap(res);
}
