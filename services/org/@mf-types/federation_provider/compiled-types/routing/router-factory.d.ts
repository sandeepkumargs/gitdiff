import { createBrowserRouter, createMemoryRouter } from "react-router-dom";
import { RoutingStrategy } from "./types";
interface CreateRouterProps {
    strategy?: RoutingStrategy;
    initialPathname?: string;
}
export declare function createRouter({ strategy, initialPathname, }: CreateRouterProps): ReturnType<typeof createMemoryRouter | typeof createBrowserRouter>;
export {};
