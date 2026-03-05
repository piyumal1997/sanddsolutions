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
const ProjectsManagement = lazy(() => import("./pages/Admin/ProjectsManagement"));
const UsersManagement = lazy(() => import("./pages/Admin/UsersManagement"));
const PackagesManagement = lazy(() => import("./pages/Admin/PackagesManagement"));
const PanelBrandsManagement = lazy(() => import("./pages/Admin/PanelBrandsManagement"));
const InverterBrandsManagement = lazy(() => import("./pages/Admin/InverterBrandsManagement"));

// In your App.jsx or wherever AdminLayout is defined
// In App.jsx – replace your AdminLayout with this
const AdminLayout = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
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

      {/* Main content – fills full height, no left gap on desktop */}
      <div className="flex-1 flex flex-col lg:ml-20">
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} fallbackElement={<LoadingSpinner />} />;
}

export default App;