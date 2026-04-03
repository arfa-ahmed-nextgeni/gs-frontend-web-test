import { Action, State } from "./ui.types";

export const initialState: State = {
  data: null,
  displayCart: false,
  displayDrawer: false,
  displayFilter: false,
  displayMobileSearch: false,
  displaySearch: false,
  displaySidebar: false,
  drawerView: null,
  isAuthorized: false,
  isStickyheader: false,
  toastText: "",
};

export function uiReducer(state: State, action: Action): State {
  switch (action.type) {
    case "CLOSE_DRAWER":
      return { ...state, displayDrawer: false };
    case "CLOSE_FILTER":
      return { ...state, displayFilter: false };
    case "CLOSE_MOBILE_SEARCH":
      return { ...state, displayMobileSearch: false };
    case "CLOSE_SEARCH":
      return { ...state, displaySearch: false };
    case "CLOSE_SIDEBAR":
      return { ...state, displaySidebar: false, drawerView: null };
    case "OPEN_DRAWER":
      return {
        ...state,
        data: action.data,
        displayDrawer: true,
        displaySidebar: false,
      };
    case "OPEN_FILTER":
      return { ...state, displayFilter: true };
    case "OPEN_MOBILE_SEARCH":
      return { ...state, displayMobileSearch: true };
    case "OPEN_SEARCH":
      return { ...state, displaySearch: true };
    case "OPEN_SIDEBAR":
      return { ...state, displaySidebar: true };
    case "SET_AUTHORIZED":
      return { ...state, isAuthorized: true };
    case "SET_DRAWER_VIEW":
      return { ...state, drawerView: action.view };
    case "SET_UNAUTHORIZED":
      return { ...state, isAuthorized: false };
    default:
      return state;
  }
}
