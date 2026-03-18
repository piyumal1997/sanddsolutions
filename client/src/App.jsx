// src/App.jsx
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  Navigate,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";
import SidebarNav from "./components/common/SidebarNav";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  isAuthenticated,
  setupActivityListeners,
  resetInactivityTimer,
} from "./utils/auth";

import AOS from 'aos';
import 'aos/dist/aos.css';


const Home = lazy(() => import("./pages/Home"));
const Solutions = lazy(() => import("./pages/Solutions"));
const SolarEnergy = lazy(() => import("./pages/SolarEnergy"));
const SolarHome = lazy(() => import("./pages/SolarHome"));
const SolarIndustry = lazy(() => import("./pages/SolarIndustry"));
const Automation = lazy(() => import("./pages/Automation"));
const Engineering = lazy(() => import("./pages/Engineering"));
const Projects = lazy(() => import("./pages/Projects"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const SolarCalculatorPage = lazy(() => import("./pages/SolarCalculatorPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const RefundPolicy = lazy(() => import("./pages/legal/RefundPolicy")); 
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy")); 
const TermsConditions = lazy(() => import("./pages/legal/TermsConditions"));
const CoolingSolutions = lazy(() => import("./pages/CoolingSolutions"));
const BTUCalculatorPage = lazy(() => import("./pages/BTUCalculatorPage"));
const ThankYouPayHere = lazy(() => import("./pages/ThankYouPayHere"));
const PaymentNotify = lazy(() => import("./pages/PaymentNotify"));

// Admin pages
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const ProjectsManagement = lazy(() => import("./pages/Admin/ProjectsManagement"));
const UsersManagement = lazy(() => import("./pages/Admin/UsersManagement"));
const PackagesManagement = lazy(() => import("./pages/Admin/PackagesManagement"));
const BrandsManagement = lazy(() => import("./pages/Admin/BrandsManagement"));
const CapacitiesManagement = lazy(() => import("./pages/Admin/CapacitiesManagement"));
const BatteryManagement = lazy(() => import("./pages/Admin/BatteryManagement"));
const InquiriesManagement = lazy(() => import("./pages/Admin/InquiriesManagement"));
const PaymentsManagement = lazy(() => import("./pages/Admin/PaymentsManagement"));
const Pay = lazy(() => import("./pages/Pay"));
const ThankYou = lazy(() => import("./pages/ThankYou")); 

// In your App.jsx or wherever AdminLayout is defined
// In App.jsx – replace your AdminLayout with this
// AdminLayout (in App.jsx or your layout file)
const AdminLayout = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      // Assuming these are imported or defined elsewhere in your file
      const cleanup = setupActivityListeners();
      resetInactivityTimer();
      return cleanup;
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;

  if (!user) return <Navigate to="/admin" replace />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarNav role={user.role} />

      {/* Main content - min-w-0 prevents flexbox from blowing out width when tables get too big */}
      {/* lg:ml-64 perfectly matches the w-64 of the sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden overflow-y-auto">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const Layout = () => (
  <ErrorBoundary>
    <Header />
    <main className="pt-[var(--total-header-height)]">
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
        <ScrollRestoration
          getKey={(location) => location.pathname + location.search}
        />
      </Suspense>
    </main>
    <Footer />
  </ErrorBoundary>
);


// New wrapper to provide Auth context inside the router
const RootWrapper = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

const router = createBrowserRouter([
  {
    element: <RootWrapper />, // AuthProvider sits here now
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/solutions", element: <Solutions /> },
          { path: "/solar-energy", element: <SolarEnergy /> },
          { path: "/solar-home", element: <SolarHome /> },
          { path: "/solar-industry", element: <SolarIndustry /> },
          { path: "/automation", element: <Automation /> },
          { path: "/engineering", element: <Engineering /> },
          { path: "/projects", element: <Projects /> },
          { path: "/about", element: <About /> },
          { path: "/contact", element: <Contact /> },
          { path: "/admin", element: <AdminLogin /> },
          { path: "/cooling-solutions", element: <CoolingSolutions /> },
          { path: "/solar-calculator", element: <SolarCalculatorPage /> },
          { path: "/btu-calculator", element: <BTUCalculatorPage /> },
          { path: "/refund-policy", element: <RefundPolicy /> },
          { path: "/privacy-policy", element: <PrivacyPolicy /> },
          { path: "/terms-and-conditions", element: <TermsConditions /> },
          { path: "/pay/:unique_id", element: <Pay /> },
          { path: "/thank-you", element: <ThankYou /> },
          { path: "/thank-you-payhere", element: <ThankYouPayHere /> },
          { path: "/payment-notify", element: <PaymentNotify /> },
          { path: "*", element: <NotFound /> },
        ],
      },
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin/dashboard", element: <Dashboard /> },
          { path: "/admin/projects", element: <ProjectsManagement /> },
          { path: "/admin/users", element: <UsersManagement /> },
          { path: "/admin/packages", element: <PackagesManagement /> },
          { path: "/admin/inquiries", element: <InquiriesManagement /> },
          { path: "/admin/brands", element: <BrandsManagement /> },
          { path: "/admin/capacities", element: <CapacitiesManagement /> },
          { path: '/admin/batteries', element: <BatteryManagement /> },
          { path: '/admin/payments', element: <PaymentsManagement /> },
          { path: "/admin/*", element: <Navigate to="/admin/dashboard" replace /> },
        ],
      },
    ],
  },
]);

function App() {
  useEffect(() => {
  AOS.init({
    once: true,
    duration: 800,
    easing: 'ease-out',
    offset: 120,          // start animation a bit earlier
    anchorPlacement: 'top-bottom',
    mirror: false,
  });
}, []);
  return <RouterProvider router={router} fallbackElement={<LoadingSpinner />} />;
}

export default App;