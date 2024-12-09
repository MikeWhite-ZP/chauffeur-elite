import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import BookingPage from "./pages/BookingPage";
import DashboardPage from "./pages/DashboardPage";
import WhoIsUSALuxuryLimo from "./pages/WhoIsUSALuxuryLimo";
import TermsAndConditions from "./pages/TermsAndConditions";
import Testimonials from "./pages/Testimonials";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import BusinessSedan from "./pages/fleet/BusinessSedan";
import BusinessSUV from "./pages/fleet/BusinessSUV";
import BusinessVan from "./pages/fleet/BusinessVan";
import Navigation from "./components/Navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "./hooks/use-user";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Service worker registration is temporarily disabled to address stability issues
// Will be re-implemented in a future update with proper offline support

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <>
      <Navigation user={user} />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/about/who-is-the-usa-luxury-limo" component={WhoIsUSALuxuryLimo} />
        <Route path="/about/terms-conditions" component={TermsAndConditions} />
        <Route path="/about/testimonials" component={Testimonials} />
        <Route path="/about/contact-us" component={ContactUs} />
        <Route path="/about/f-a-q" component={FAQ} />
        <Route path="/fleet/business-sedan" component={BusinessSedan} />
        <Route path="/fleet/business-suv" component={BusinessSUV} />
        <Route path="/fleet/business-van" component={BusinessVan} />
        {!user && <Route path="/auth" component={AuthPage} />}
        {user && (
          <>
            <Route path="/book" component={BookingPage} />
            <Route path="/dashboard" component={DashboardPage} />
          </>
        )}
        <Route>404 Page Not Found</Route>
      </Switch>
    </>
  );
}

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Ensure we only create one root
let root: ReturnType<typeof createRoot>;
try {
  root = createRoot(rootElement);
} catch (e) {
  console.error("Error creating root:", e);
  throw e;
}

// Render the app
root.render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
