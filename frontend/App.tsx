import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { Login } from "./routes/Login";
import { Home } from "./routes/Home";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const routeTree = rootRoute.addChildren([homeRoute, loginRoute]);

const router = createRouter({ routeTree });

export function App() {
  return <RouterProvider router={router} />;
}

export default App;
