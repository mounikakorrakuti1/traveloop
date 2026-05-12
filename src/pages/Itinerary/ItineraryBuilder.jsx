import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrip } from "@/api/trips.api";
import { createStop, deleteStop, listStops } from "@/api/stops.api";
import { searchActivities, assignActivityToStop, removeActivityFromStop } from "@/api/activities.api";
import { searchCities } from "@/api/cities.api";
import { generateTripPlan } from "@/api/ai.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { formatDate, getCityLabel, getStopCity, usd } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useMap } from "@/hooks/useMap";
import { buildAiContext } from "@/lib/aiContext";
import { useAuthStore } from "@/store/authStore";
import { updateProfile } from "@/api/auth.api";
import { MapView } from "@/components/itinerary/MapView";
import { AiThinkingPanel } from "@/components/ai/AiThinkingPanel";
import { useToast } from "@/components/shared/toast-context";
import "@/styles/components/itinerary.css";
import "@/styles/components/ui.css";
import { Calendar, Trash2, Plus, Sparkles, MapPin } from "lucide-react";

const daysBetweenInclusive = (start, end, fallback) => {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return fallback;
  return Math.max(1, Math.round((endDate - startDate) / 86400000) + 1);
};

const extractDestination = (trip, stops) => {
  const lastStop = stops.at(-1);
  const lastCity = getStopCity(lastStop);
  if (lastCity?.name) return lastCity.name;
  return trip?.title || "this destination";
};

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const { requestLocation, isLocating } = useGeolocation();
  const [cityQuery, setCityQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [activityQuery, setActivityQuery] = useState("");
  const [activeStopId, setActiveStopId] = useState("");
  const [form, setForm] = useState({ arrivalDate: "", departureDate: "", notes: "", accommodationName: "", accommodationCost: "" });
  const debouncedCityQuery = useDebounce(cityQuery);

  const { data: trip } = useQuery({ queryKey: QUERY_KEYS.trip(id ?? ""), queryFn: () => getTrip(id), enabled: Boolean(id) });
  const { data: stops = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.stops(id ?? ""), queryFn: () => listStops(id), enabled: Boolean(id) });
  const { data: routeData } = useMap(id);
  const { data: cityResults } = useQuery({
    queryKey: QUERY_KEYS.cities(debouncedCityQuery),
    queryFn: () => searchCities({ q: debouncedCityQuery, limit: 8 }),
    enabled: debouncedCityQuery.trim().length >= 2,
    staleTime: 10 * 60 * 1000,
  });

  const activeStop = useMemo(() => stops.find((stop) => stop.id === activeStopId) ?? stops[0], [activeStopId, stops]);
  const activeCity = getStopCity(activeStop);
  const { data: activityResults } = useQuery({
    queryKey: QUERY_KEYS.activities({ cityId: activeCity?.id, q: activityQuery }),
    queryFn: () => searchActivities({ cityId: activeCity.id, q: activityQuery || undefined, limit: 8 }),
    enabled: Boolean(activeCity?.id),
  });

  const invalidateStops = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stops(id ?? "") });
  const addStopMutation = useMutation({
    mutationFn: () => createStop(id, {
      cityId: selectedCity.id,
      orderIndex: stops.length,
      arrivalDate: form.arrivalDate,
      departureDate: form.departureDate,
      notes: form.notes || undefined,
      accommodationName: form.accommodationName || undefined,
      accommodationCost: form.accommodationCost === "" ? undefined : Number(form.accommodationCost),
    }),
    onSuccess: () => {
      setSelectedCity(null);
      setCityQuery("");
      setForm({ arrivalDate: "", departureDate: "", notes: "", accommodationName: "", accommodationCost: "" });
      invalidateStops();
      queryClient.invalidateQueries({ queryKey: ["trips", id, "route"] });
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (stopId) => deleteStop(id, stopId),
    onSuccess: () => {
      invalidateStops();
      queryClient.invalidateQueries({ queryKey: ["trips", id, "route"] });
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const assignMutation = useMutation({
    mutationFn: ({ stopId, activityId }) => assignActivityToStop(id, stopId, { activityId }),
    onSuccess: invalidateStops,
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const removeActivityMutation = useMutation({
    mutationFn: ({ stopId, stopActivityId }) => removeActivityFromStop(id, stopId, stopActivityId),
    onSuccess: invalidateStops,
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const aiMutation = useMutation({
    mutationFn: async () => {
      const coords = await requestLocation();
      if (!coords) {
        showToast("Location access denied. AI will generate without nearby recommendations.", "info");
      } else {
        await updateProfile({
          travelPreferences: {
            ...(user?.travelPreferences || {}),
            currentLocation: coords,
            locationCapturedAt: new Date().toISOString(),
          },
        }).catch(() => {});
      }
      const destination = extractDestination(trip, stops);
      const stopLabels = stops.map((stop) => getCityLabel(getStopCity(stop))).filter(Boolean);
      const days = daysBetweenInclusive(trip?.startDate, trip?.endDate, Math.max(1, stops.length || 3));
      const interests = [trip?.vibe, trip?.tripType, ...stopLabels].filter(Boolean);
      return generateTripPlan({
        prompt: `${trip?.title || "Trip"}: ${stopLabels.join(" -> ") || destination}`,
        days,
        vibe: trip?.vibe || "comfort",
        tripType: trip?.tripType || "solo",
        preferences: {
          source: coords ? "current location" : undefined,
          destination,
          startDate: trip?.startDate,
          endDate: trip?.endDate,
          budgetInr: trip?.budgetCapInr ?? trip?.budgetCapUsd,
          placesToCover: stopLabels,
          stayPreference: stops.find((stop) => stop.accommodationName)?.accommodationName || undefined,
          transportationPreferences: ["flight", "train", "cab"],
          foodPreference: user?.travelPreferences?.foodPreference,
        },
        userContext: buildAiContext(user, {
          currentLocation: coords || undefined,
          interests,
          previousTrips: stops.map((stop) => getCityLabel(getStopCity(stop))).filter(Boolean),
          groupSize: trip?.tripType === "group" ? 4 : 1,
          foodPreference: user?.travelPreferences?.foodPreference,
        }),
      });
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const addStop = (e) => {
    e.preventDefault();
    if (!selectedCity) return showToast("Choose a city from search results first.", "error");
    if (!form.arrivalDate || !form.departureDate) return showToast("Arrival and departure dates are required.", "error");
    if (form.departureDate < form.arrivalDate) return showToast("Departure date must be on or after arrival.", "error");
    addStopMutation.mutate();
  };

  return (
    <div className="itinerary-root">
      <div className="itinerary-header">
        <div>
          <h1 className="itinerary-title">{trip?.title || "Itinerary Builder"}</h1>
          <Link to={ROUTES.tripItineraryView(id)} className="btn btn-secondary btn-sm">View itinerary</Link>
        </div>
        <button className="btn btn-primary" disabled={aiMutation.isPending || isLocating} onClick={() => aiMutation.mutate()}><Sparkles size={16} /> {isLocating ? "Locating..." : "AI Ideas"}</button>
      </div>

      <MapView stops={stops} routeData={routeData} height="320px" />

      {aiMutation.isPending && (
        <AiThinkingPanel
          title={isLocating ? "Reading nearby context" : "Finding itinerary ideas"}
          destination={trip?.title || "this trip"}
        />
      )}

      <form className="card" onSubmit={addStop} style={{ display: "grid", gap: "var(--sp-md)" }}>
        <div className="input-wrap">
          <label className="input-label">City</label>
          <input className="input" value={selectedCity ? getCityLabel(selectedCity) : cityQuery} onChange={(e) => { setSelectedCity(null); setCityQuery(e.target.value); }} placeholder="Search city" />
          {!selectedCity && cityResults?.cities?.length > 0 && (
            <div className="card" style={{ padding: "var(--sp-xs)", marginTop: "var(--sp-xs)" }}>
              {cityResults.cities.map((city) => (
                <button key={city.id} type="button" className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => setSelectedCity(city)}>
                  <MapPin size={14} /> {getCityLabel(city)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="stop-card-meta">
          <div className="input-wrap"><label className="input-label">Arrival</label><input className="input" type="date" value={form.arrivalDate} onChange={(e) => setForm((f) => ({ ...f, arrivalDate: e.target.value }))} /></div>
          <div className="input-wrap"><label className="input-label">Departure</label><input className="input" type="date" min={form.arrivalDate} value={form.departureDate} onChange={(e) => setForm((f) => ({ ...f, departureDate: e.target.value }))} /></div>
          <div className="input-wrap"><label className="input-label">Accommodation</label><input className="input" value={form.accommodationName} onChange={(e) => setForm((f) => ({ ...f, accommodationName: e.target.value }))} /></div>
          <div className="input-wrap"><label className="input-label">Cost INR</label><input className="input" type="number" min="0" value={form.accommodationCost} onChange={(e) => setForm((f) => ({ ...f, accommodationCost: e.target.value }))} /></div>
        </div>
        <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Stop notes" />
        <button className="btn btn-primary" disabled={addStopMutation.isPending}><Plus size={16} /> Add Stop</button>
      </form>

      {!aiMutation.isPending && aiMutation.data?.stops?.length > 0 && (
        <div className="card ai-result-card">
          <h3 className="note-card-title">AI itinerary ideas</h3>
          {aiMutation.data.summary && <p style={{ color: "var(--cl-text-muted)" }}>{aiMutation.data.summary}</p>}
          {aiMutation.data.routeStrategy && <p><strong>Route:</strong> {aiMutation.data.routeStrategy}</p>}
          {aiMutation.data.totalEstimatedCostInr && <p><strong>Estimated total:</strong> {usd(aiMutation.data.totalEstimatedCostInr)}</p>}
          <div className="ai-idea-grid">
            {aiMutation.data.stops.map((stop, index) => (
              <div key={`${stop.city}-${index}`} className="ai-idea-item">
                <div className="ai-idea-kicker">{stop.days} day{stop.days === 1 ? "" : "s"}</div>
                <strong>{stop.city}, {stop.country}</strong>
                <p>{stop.dailyBreakdown?.[0]?.morning || stop.activities?.map((a) => a.name).join(", ")}</p>
                {stop.estimatedCostInr && <p><strong>{usd(stop.estimatedCostInr)}</strong></p>}
                {stop.foodRecommendations?.length > 0 && <p>{stop.foodRecommendations.slice(0, 2).join(", ")}</p>}
              </div>
            ))}
          </div>
          {aiMutation.data.timingTips?.length > 0 && (
            <div className="post-tags" style={{ marginTop: "var(--sp-md)" }}>
              {aiMutation.data.timingTips.slice(0, 3).map((tip) => <span key={tip}>{tip}</span>)}
            </div>
          )}
        </div>
      )}

      {isLoading ? <div className="empty-state">Loading stops...</div> : stops.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon"><Calendar size={48} /></div><div className="empty-state-title">No stops yet</div></div>
      ) : stops.map((stop, index) => {
        const city = getStopCity(stop);
        const stopActivities = stop.activities || stop.stopActivities || [];
        return (
          <div key={stop.id} className="stop-card">
            <div className="stop-card-header">
              <div className="stop-card-number">{String(index + 1).padStart(2, "0")}</div>
              <div className="stop-card-title">{getCityLabel(city)}</div>
              <div className="stop-card-actions">
                <button className="btn btn-ghost btn-icon" onClick={() => deleteMutation.mutate(stop.id)} title="Remove stop" style={{ color: "var(--cl-error)" }}><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="stop-card-body">
              <p style={{ color: "var(--cl-text-muted)" }}>{formatDate(stop.arrivalDate)} to {formatDate(stop.departureDate)} {stop.accommodationCost ? `- ${usd(stop.accommodationCost)} lodging` : ""}</p>
              {stop.notes && <p>{stop.notes}</p>}
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveStopId(stop.id)}>Find activities</button>
              {stopActivities.length > 0 && (
                <div style={{ display: "flex", gap: "var(--sp-xs)", flexWrap: "wrap", marginTop: "var(--sp-sm)" }}>
                  {stopActivities.map((sa) => (
                    <button key={sa.id} className="btn btn-ghost btn-xs" onClick={() => removeActivityMutation.mutate({ stopId: stop.id, stopActivityId: sa.id })}>
                      {sa.activity?.name || "Activity"} x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {activeStop && (
        <div className="card">
          <h3 className="note-card-title">Activities for {getCityLabel(activeCity)}</h3>
          <input className="input" value={activityQuery} onChange={(e) => setActivityQuery(e.target.value)} placeholder="Search activities" style={{ marginBottom: "var(--sp-sm)" }} />
          <div style={{ display: "grid", gap: "var(--sp-sm)" }}>
            {(activityResults?.activities ?? []).map((activity) => (
              <button key={activity.id} className="btn btn-secondary btn-sm" onClick={() => assignMutation.mutate({ stopId: activeStop.id, activityId: activity.id })}>
                + {activity.name} ({usd(activity.estimatedCostInr)})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
