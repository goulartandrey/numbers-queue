import { createBrowserRouter } from "react-router";
import GenerateNumber from "@/pages/GenerateNumber/index";
import Panel from "@/pages/Panel/index";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/Login";
import OperatorPage from "@/pages/Operator";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  { path: "/", element: <GenerateNumber /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/panel", element: <Panel /> },
      { path: "/operator", element: <OperatorPage /> },
    ],
  },
]);
