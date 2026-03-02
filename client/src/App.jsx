// src/App.jsx
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";
import SidebarNav from "./components/common/SidebarNav";
import {
  isAuthenticated,
  setupActivityListeners,
  resetInactivityTimer,
  protectedFetch,
  getCurrentUser,
  logout,
} from "../utils/auth";
import { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";

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
const Admin = lazy(() => import("./pages/AdminDashboard"));
const SolarCalculatorPage = lazy(() => import("./pages/SolarCalculatorPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));

// Admin pages
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const ProjectsManagement = lazy(
  () => import("./pages/Admin/ProjectsManagement"),
);
const UsersManagement = lazy(() => import("./pages/Admin/UsersManagement"));
const PackagesManagement = lazy(
  () => import("./pages/Admin/PackagesManagement"),
);
const PanelBrandsManagement = lazy(
  () => import("./pages/Admin/PanelBrandsManagement"),
);
const InverterBrandsManagement = lazy(
  () => import("./pages/Admin/InverterBrandsManagement"),
);

const AdminLayout = () => {
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated()) {
      const cleanup = setupActivityListeners();
      resetInactivityTimer();
      return cleanup;
    }
  }, []);

  if (!isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 ml-64 bg-gray-50 p-8">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

const Layout = () => (
  <>
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
  </>
);

const router = createBrowserRouter([
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
      { path: "/solar-calculator", element: <SolarCalculatorPage /> },
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
      { path: "/admin/panel-brands", element: <PanelBrandsManagement /> },
      { path: "/admin/inverter-brands", element: <InverterBrandsManagement /> },
      { path: "/admin/*", element: <Navigate to="/admin/dashboard" replace /> },
    ],
  },
]);

function App() {
  return (
    <RouterProvider router={router} fallbackElement={<LoadingSpinner />} />
  );
}

export default App;
