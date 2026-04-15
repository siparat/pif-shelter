import { adminRoutes, MenuItem } from './routes';

export const MENU: MenuItem[] = adminRoutes.filter((route) => route.showInMenu);
