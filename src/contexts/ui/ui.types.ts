export type Action =
  | { data: unknown; type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "CLOSE_FILTER" }
  | { type: "CLOSE_MOBILE_SEARCH" }
  | { type: "CLOSE_SEARCH" }
  | { type: "CLOSE_SIDEBAR" }
  | { type: "OPEN_FILTER" }
  | { type: "OPEN_MOBILE_SEARCH" }
  | { type: "OPEN_SEARCH" }
  | { type: "OPEN_SIDEBAR" }
  | { type: "SET_AUTHORIZED" }
  | { type: "SET_DRAWER_VIEW"; view: DRAWER_VIEWS }
  | { type: "SET_UNAUTHORIZED" };

export type DRAWER_VIEWS = "CART_SIDEBAR" | "MOBILE_MENU" | "ORDER_DETAILS";

export interface State {
  data?: unknown;
  displayCart: boolean;
  displayDrawer: boolean;
  displayFilter: boolean;
  displayMobileSearch: boolean;
  displaySearch: boolean;
  displaySidebar: boolean;
  drawerView: DRAWER_VIEWS | null;
  isAuthorized: boolean;
  isStickyheader: boolean;
  toastText: string;
}
