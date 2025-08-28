import "./App.css";
import "primeicons/primeicons.css";
import { RoutingStrategy } from "./routing/types";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
declare const mount: ({ mountPoint, initialPathname, routingStrategy, }: {
    mountPoint: HTMLElement;
    initialPathname?: string;
    routingStrategy?: RoutingStrategy;
}) => () => void;
export { mount };
