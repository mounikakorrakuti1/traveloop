import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { ROUTES } from "@/lib/constants";

/* ── Lazy page imports ───────────────────────────────────── */
const LandingPage          = lazy(() => import("@/pages/Landing/LandingPage"));
const LoginPage            = lazy(() => import("@/pages/Auth/Login"));
const SignupPage           = lazy(() => import("@/pages/Auth/Signup"));
const DashboardPage        = lazy(() => import("@/pages/Dashboard/Dashboard"));
const TripListPage         = lazy(() => import("@/pages/Trips/TripList"));
const CreateTripPage       = lazy(() => import("@/pages/Trips/CreateTrip"));
const ItineraryBuilderPage = lazy(() => import("@/pages/Itinerary/ItineraryBuilder"));
const ItineraryViewPage    = lazy(() => import("@/pages/Itinerary/ItineraryView"));
const BudgetBreakdownPage  = lazy(() => import("@/pages/Budget/BudgetBreakdown"));
const PackingChecklistPage = lazy(() => import("@/pages/Packing/PackingChecklist"));
const TripNotesPage        = lazy(() => import("@/pages/Notes/TripNotes"));
const AdminPanelPage       = lazy(() => import("@/pages/Admin/AdminPanel"));
const UserProfilePage      = lazy(() => import("@/pages/Profile/UserProfile"));
const SearchPage           = lazy(() => import("@/pages/Search/SearchPage"));
const CommunityTabPage     = lazy(() => import("@/pages/Community/CommunityTab"));
const TripDetailPage       = lazy(() => import("@/pages/Trips/TripDetail"));
const PublicItineraryPage  = lazy(() => import("@/pages/Public/PublicItinerary"));
const ForgotPasswordPage   = lazy(() => import("@/pages/Auth/ForgotPassword"));
const CitiesPage           = lazy(() => import("@/pages/Search/Cities"));
const DocsPage             = lazy(() => import("@/pages/Trips/Docs"));

/* ── Suspense fallback ───────────────────────────────────── */
function PageLoader() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "grid",
      placeItems: "center",
      background: "var(--cl-bg)",
    }}>
      <div style={{
        width: "2.5rem", height: "2.5rem",
        border: "3px solid var(--cl-border)",
        borderTopColor: "var(--cl-accent)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* ── Public ────────────────────────────────────── */}
            <Route path={ROUTES.landing}       element={<AnimatedPage><LandingPage /></AnimatedPage>} />
            <Route path={ROUTES.login}         element={<AnimatedPage><LoginPage /></AnimatedPage>} />
            <Route path={ROUTES.signup}        element={<AnimatedPage><SignupPage /></AnimatedPage>} />
            <Route path="/public/trips/:slug"  element={<AnimatedPage><PublicItineraryPage /></AnimatedPage>} />
            <Route path={ROUTES.forgotPassword} element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />

            {/* ── Protected (behind AppShell + Navbar) ──────── */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path={ROUTES.home}                         element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
              <Route path={ROUTES.trips}                        element={<AnimatedPage><TripListPage /></AnimatedPage>} />
              <Route path={ROUTES.tripNew}                      element={<AnimatedPage><CreateTripPage /></AnimatedPage>} />
              <Route path="/trips/:id"                          element={<AnimatedPage><TripDetailPage /></AnimatedPage>} />
              <Route path="/trips/:id/itinerary"                element={<AnimatedPage><ItineraryBuilderPage /></AnimatedPage>} />
              <Route path="/trips/:id/itinerary/view"           element={<AnimatedPage><ItineraryViewPage /></AnimatedPage>} />
              <Route path="/trips/:id/budget"                   element={<AnimatedPage><BudgetBreakdownPage /></AnimatedPage>} />
              <Route path="/trips/:id/packing"                  element={<AnimatedPage><PackingChecklistPage /></AnimatedPage>} />
              <Route path="/trips/:id/notes"                    element={<AnimatedPage><TripNotesPage /></AnimatedPage>} />
              <Route path={ROUTES.profile}                      element={<AnimatedPage><UserProfilePage /></AnimatedPage>} />
              <Route path={ROUTES.search}                       element={<AnimatedPage><SearchPage /></AnimatedPage>} />
              <Route path={ROUTES.community}                    element={<AnimatedPage><CommunityTabPage /></AnimatedPage>} />
              <Route path={ROUTES.admin}                        element={<AnimatedPage><AdminPanelPage /></AnimatedPage>} />
              <Route path={ROUTES.cities}                       element={<AnimatedPage><CitiesPage /></AnimatedPage>} />
              <Route path="/trips/:id/docs"                     element={<AnimatedPage><DocsPage /></AnimatedPage>} />
            </Route>

            {/* ── Fallback ──────────────────────────────────── */}
            <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}
