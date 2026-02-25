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
      { path: "/admin", element: <Admin /> },
      { path: "/solar-calculator", element: <SolarCalculatorPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <RouterProvider router={router} fallbackElement={<LoadingSpinner />} />
  );
}

export default App;
