import { webRoutes, WebRoute } from './routes';

export const MENU: WebRoute[] = webRoutes.filter((route) => route.showInMenu);
