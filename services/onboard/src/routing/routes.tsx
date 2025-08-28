import { Outlet, type RouteObject } from "react-router-dom";
import { NavigationManager } from "../components/NavigationManager";
import Homepage from "../pages/landing-page";
import LandingPage from "../pages/landingPage";
import SignUp from "../pages/signup-page";
import Onboarding from "../pages/onboarding-page/index";
import NewSignUp from "../pages/signupPage/index";
import Suite from "../pages/Suite/index";
import Info from '../pages/Info/index';
import Register from '../pages/Register/index';
import Layout from "./layout";
import InviteRegistration from "../pages/invite-registration";
import LogoManager from "../components/DynamicLogo/LogoManager";
import AmbiguityChat from "../pages/Chat/index";
import NotFound from "../pages/404";
import QAMetricsDashboard from "../pages/qa-metrics-dashboard";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <NavigationManager>
        <Layout showTopNavBar={true} />
      </NavigationManager>
    ),
    children: [
      {
        path: "",
        element: <LandingPage />,
      },
      {
        path: "welcome",
        element: <Onboarding />,
      },
      {
        path: "suite",
        element: <Suite />,
      },
      {
        path: "info",
        element: <Info />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "invitation",
        element: <InviteRegistration />,
      },
    ],
  },
  {
    path: "/",
    element: (
      <NavigationManager>
        <Layout showTopNavBar={false} />
      </NavigationManager>
    ),
    children: [
      {
        path: "changeYourLogo",
        element: <LogoManager />,
      },
      // {
      //   path: "sign-up",
      //   element: <NewSignUp />,
      // },
      {
        path: "chat",
        element: <AmbiguityChat />,
      },
      {
        path: "defectzen", // Add this new route
        element: <QAMetricsDashboard />
      },
      {
        path: "*",
        element: <NotFound />, // Handle 404 errors
      },
    ],
  }
]
