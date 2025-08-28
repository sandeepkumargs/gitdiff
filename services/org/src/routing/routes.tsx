import { RouteObject } from "react-router-dom";
import { NavigationManager } from "../components/NavigationManager";
import ProjectDashboard from "../App";
import Login from "../pages/login-page";
import SignUp from "../pages/User-Registration/index";
import Layout from "./layout";
import Portfolio from "../pages/Portfolio/index";
import Projects from "../pages/Projects";
import Table from "../pages/table";
import AmbiguityChecker from "../pages/ambiguity/ambiguity";
import MindMapsViewer from "../pages/mindmaps/mindmaps";
import TestScenarios from "../pages/test-scenarios/index"
import VerifyLogin from "../pages/verify";
import PrivateRoute from "./private-route";
import Collaborators from "../components/collaborators";
import NotFound from "../pages/404";
import RouteErrorPage from "../components/ErrorPage/RouteErrorPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (

      <NavigationManager>
        <Layout showTopNavBar={false} />
      </NavigationManager>

    ),
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: "",
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "sign-up",
        element: <SignUp />,
      },
      {
        path: "verify",
        element: <VerifyLogin />,
      },
      {
        path: "*",
        element: <NotFound />, // Handle 404 errors
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
      <NavigationManager>
        <Layout showTopNavBar={true}  />
      </NavigationManager>
      </PrivateRoute>
    ),
    
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: "",
        element: <ProjectDashboard />,
      },
      {
        path: "portfolio",
        element: <Portfolio />,
      },
      {
        path: "project",
        element: <Projects />,
      },
      {
        path: "/dashboard/collaborators",
        element: <Collaborators />
      },
      {
        path: "ac/table",
        element: <Table />
      },
      {
        path: "ac/checker",
        element: <AmbiguityChecker />
      },
      {
        path: "mm/table",
        element: <Table />
      },
      {
        path: "mm/viewer",
        element: <MindMapsViewer />
      },
      {
        path: "ts/table",
        element: <Table />
      },
      {
        path: "ts/generator",
        element: <TestScenarios />
      },
      {
        path: "*",
        element: <NotFound />, // Handle 404 errors
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];
