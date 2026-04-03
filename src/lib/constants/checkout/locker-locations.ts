import FodelIcon from "@/assets/icons/fodel-icon.svg";
import FodelSelectedIcon from "@/assets/icons/fodel-selected-icon.svg";
import RedBoxIcon from "@/assets/icons/redbox-icon.svg";
import RedBoxSelectedIcon from "@/assets/icons/redbox-selected-icon.svg";

export enum LockerType {
  Fodel = "pickup_fodel",
  Redbox = "pickup_redbox",
}

export const LOCKER_ICONS = {
  [LockerType.Fodel]: {
    icon: FodelIcon,
    selectedIcon: FodelSelectedIcon,
  },
  [LockerType.Redbox]: {
    icon: RedBoxIcon,
    selectedIcon: RedBoxSelectedIcon,
  },
} as const;
