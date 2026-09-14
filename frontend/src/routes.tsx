// src/routes.tsx
import { createBrowserRouter } from "react-router";
import GenerateNumber from "@/pages/GenerateNumber/index";
import Panel from "@/pages/Panel/index";
import OperatorPage from "./pages/Operator";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <GenerateNumber />,
  },
  {
    path: "/panel",
    element: <Panel />,
  },
  {
    path: "/operator",
    element: <OperatorPage />,
  },
]);
