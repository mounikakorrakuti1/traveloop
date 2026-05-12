import { http, HttpResponse } from "msw";
const MOCK_USER = {
    id: "user-1",
    email: "dev@traveloop.local",
    name: "Dev Traveler",
    phoneNumber: "+919876543210",
    avatarUrl: null,
    travelerProfile: "solo",
    isAdmin: false,
    createdAt: new Date().toISOString()
};
const MOCK_CITY_GOA = {
    id: "city-goa",
    name: "Goa",
    state: "Goa",
    country: "India",
    countryCode: "IN",
    latitude: 15.2993,
    longitude: 74.124,
    costIndex: "medium",
    areaType: "coastal",
    bestSeason: "Nov–Feb",
    isRegionalGem: true,
    thumbnailUrl: null
};
const MOCK_CITY_JAI = {
    id: "city-jai",
    name: "Jaipur",
    state: "Rajasthan",
    country: "India",
    countryCode: "IN",
    latitude: 26.9124,
    longitude: 75.7873,
    costIndex: "low",
    areaType: "city",
    bestSeason: "Oct–Mar",
    isRegionalGem: true,
    thumbnailUrl: null
};
const MOCK_TRIP = {
    id: "trip-1",
    userId: MOCK_USER.id,
    title: "Coastal & palaces",
    description: "Demo itinerary from MSW — playbook §5.3.",
    coverPhotoUrl: null,
    startDate: "2026-06-01",
    endDate: "2026-06-08",
    tripType: "couple",
    budgetCapUsd: 2400,
    vibe: "comfort",
    isPublic: true,
    publicSlug: "demo-coastal",
    status: "planning",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};
let mockStops = [
    {
        id: "stop-1",
        tripId: MOCK_TRIP.id,
        cityId: MOCK_CITY_GOA.id,
        orderIndex: 0,
        arrivalDate: "2026-06-01",
        departureDate: "2026-06-03",
        notes: "Beach days",
        accommodationName: "Coastal inn",
        accommodationCost: 180,
        city: MOCK_CITY_GOA,
        activities: []
    },
    {
        id: "stop-2",
        tripId: MOCK_TRIP.id,
        cityId: MOCK_CITY_JAI.id,
        orderIndex: 1,
        arrivalDate: "2026-06-04",
        departureDate: "2026-06-08",
        notes: "Palaces & food",
        accommodationName: "Haveli stay",
        accommodationCost: 320,
        city: MOCK_CITY_JAI,
        activities: []
    }
];
const MOCK_BUDGET = {
    tripId: MOCK_TRIP.id,
    totalBudgetCapUsd: MOCK_TRIP.budgetCapUsd ?? null,
    totalSpentUsd: 2100,
    byDay: [
        {
            date: "2026-06-01",
            stopId: "stop-1",
            cityName: "Goa",
            accommodationCostUsd: 180,
            activitiesCostUsd: 120,
            totalUsd: 300
        },
        {
            date: "2026-06-04",
            stopId: "stop-2",
            cityName: "Jaipur",
            accommodationCostUsd: 320,
            activitiesCostUsd: 280,
            totalUsd: 600
        }
    ],
    byCategory: [
        {
            category: "Stay",
            totalUsd: 500,
            percentage: 45
        },
        {
            category: "Food",
            totalUsd: 400,
            percentage: 36
        },
        {
            category: "Sightseeing",
            totalUsd: 200,
            percentage: 18
        }
    ],
    isOverBudget: false,
    remainingUsd: 300
};
const MOCK_NOTES = [
    {
        id: "note-1",
        tripId: MOCK_TRIP.id,
        stopId: null,
        title: "Visas",
        content: "Check e-visa requirements before departure.",
        noteType: "logistics",
        isImportant: true,
        createdAt: new Date().toISOString()
    }
];
const MOCK_PACKING = [
    {
        id: "pack-1",
        tripId: MOCK_TRIP.id,
        name: "Sunscreen",
        category: "toiletries",
        isPacked: false,
        aiSuggested: true
    }
];
const AI_SAMPLE = {
    stops: [
        {
            city: "Udaipur",
            country: "India",
            days: 3,
            estimatedCostUsd: 650,
            activities: [
                {
                    name: "Lake Pichola boat",
                    category: "sightseeing",
                    costUsd: 40,
                    durationHours: 2
                },
                {
                    name: "City palace tour",
                    category: "cultural",
                    costUsd: 25,
                    durationHours: 3
                }
            ]
        }
    ]
};
/** Playbook §5.3 — shapes MUST match `shared/types` */ export const handlers = [
    http.get("*/api/v1/auth/me", ()=>HttpResponse.json({
            data: MOCK_USER,
            meta: null
        })),
    http.post("*/api/v1/auth/login", async ()=>HttpResponse.json({
            data: {
                user: MOCK_USER
            },
            meta: null
        })),
    http.post("*/api/v1/auth/register", async ()=>HttpResponse.json({
            data: {
                user: MOCK_USER
            },
            meta: null
        })),
    http.post("*/api/v1/auth/logout", ()=>HttpResponse.json({
            data: {
                message: "Logged out"
            },
            meta: null
        })),
    http.post("*/api/v1/auth/forgot-password", async ()=>HttpResponse.json({
            data: {
                message: "Reset email queued"
            },
            meta: null
        })),
    http.post("*/api/v1/auth/reset-password", async ()=>HttpResponse.json({
            data: {
                message: "Password updated"
            },
            meta: null
        })),
    http.get("*/api/v1/trips", ()=>HttpResponse.json({
            data: [
                {
                    ...MOCK_TRIP,
                    stops: mockStops
                }
            ],
            meta: {
                total: 1,
                page: 1,
                limit: 20
            }
        })),
    http.get("*/api/v1/trips/:tripId", ({ params })=>{
        const tripId = params.tripId;
        if (tripId !== MOCK_TRIP.id) {
            return HttpResponse.json({
                error: "Not found",
                code: "NOT_FOUND",
                details: null
            }, {
                status: 404
            });
        }
        return HttpResponse.json({
            data: {
                ...MOCK_TRIP,
                stops: mockStops
            },
            meta: null
        });
    }),
    http.post("*/api/v1/trips", async ({ request })=>{
        const body = await request.json();
        const trip = {
            ...MOCK_TRIP,
            id: `trip-${Date.now()}`,
            title: body.title ?? "Untitled",
            startDate: body.startDate ?? MOCK_TRIP.startDate,
            endDate: body.endDate ?? MOCK_TRIP.endDate,
            tripType: body.tripType ?? "solo",
            budgetCapUsd: body.budgetCapUsd ?? null,
            vibe: body.vibe ?? null,
            updatedAt: new Date().toISOString()
        };
        return HttpResponse.json({
            data: trip,
            meta: null
        }, {
            status: 201
        });
    }),
    http.get("*/api/v1/trips/:tripId/stops", ({ params })=>{
        const tripId = params.tripId;
        const stops = mockStops.filter((s)=>s.tripId === tripId);
        return HttpResponse.json({
            data: stops,
            meta: null
        });
    }),
    http.put("*/api/v1/trips/:tripId/stops/reorder", async ({ params, request })=>{
        const tripId = params.tripId;
        const body = await request.json();
        const orderMap = new Map(body.stopOrders.map((o)=>[
                o.id,
                o.orderIndex
            ]));
        const others = mockStops.filter((s)=>s.tripId !== tripId);
        const mine = mockStops.filter((s)=>s.tripId === tripId);
        const sorted = [
            ...mine
        ].sort((a, b)=>(orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)).map((s)=>({
                ...s,
                orderIndex: orderMap.get(s.id) ?? s.orderIndex
            }));
        mockStops = [
            ...others,
            ...sorted
        ];
        return HttpResponse.json({
            data: sorted,
            meta: null
        });
    }),
    http.get("*/api/v1/trips/:tripId/budget", ({ params })=>{
        const tripId = params.tripId;
        if (tripId !== MOCK_TRIP.id) {
            return HttpResponse.json({
                error: "Not found",
                code: "NOT_FOUND",
                details: null
            }, {
                status: 404
            });
        }
        return HttpResponse.json({
            data: MOCK_BUDGET,
            meta: null
        });
    }),
    http.get("*/api/v1/trips/:tripId/notes", ({ params })=>{
        const tripId = params.tripId;
        const notes = MOCK_NOTES.filter((n)=>n.tripId === tripId);
        return HttpResponse.json({
            data: notes,
            meta: {
                total: notes.length,
                page: 1,
                limit: 20
            }
        });
    }),
    http.get("*/api/v1/trips/:tripId/packing", ({ params })=>{
        const tripId = params.tripId;
        const rows = MOCK_PACKING.filter((p)=>p.tripId === tripId);
        return HttpResponse.json({
            data: rows,
            meta: null
        });
    }),
    http.get("*/api/v1/cities", ({ request })=>{
        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").toLowerCase();
        const cities = [
            MOCK_CITY_GOA,
            MOCK_CITY_JAI
        ].filter((c)=>q.length >= 2 && `${c.name} ${c.country}`.toLowerCase().includes(q));
        return HttpResponse.json({
            data: cities,
            meta: {
                total: cities.length,
                page: 1,
                limit: 20
            }
        });
    }),
    http.post("*/api/v1/ai/itinerary", async ()=>HttpResponse.json({
            data: AI_SAMPLE,
            meta: null
        })),
    http.post("*/api/v1/ai/trip-plan", async ()=>HttpResponse.json({
            data: AI_SAMPLE,
            meta: null
        })),
    http.get("*/api/v1/public/trips/:slug", ({ params })=>{
        const slug = params.slug;
        if (slug !== MOCK_TRIP.publicSlug) {
            return HttpResponse.json({
                error: "Not found",
                code: "NOT_FOUND",
                details: null
            }, {
                status: 404
            });
        }
        return HttpResponse.json({
            data: {
                ...MOCK_TRIP,
                stops: mockStops
            },
            meta: null
        });
    }),
    http.post("*/api/v1/public/trips/:slug/copy", ({ params })=>{
        const slug = params.slug;
        if (slug !== MOCK_TRIP.publicSlug) {
            return HttpResponse.json({
                error: "Not found",
                code: "NOT_FOUND",
                details: null
            }, {
                status: 404
            });
        }
        const copy = {
            ...MOCK_TRIP,
            id: `trip-copy-${Date.now()}`,
            title: `${MOCK_TRIP.title} (copy)`,
            publicSlug: null,
            isPublic: false,
            updatedAt: new Date().toISOString()
        };
        return HttpResponse.json({
            data: copy,
            meta: null
        }, {
            status: 201
        });
    }),
    http.post("*/api/v1/media/sign", ()=>HttpResponse.json({
            data: {
                signature: "demo",
                timestamp: Math.floor(Date.now() / 1000),
                cloudName: "demo"
            },
            meta: null
        }))
];
