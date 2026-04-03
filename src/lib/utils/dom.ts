import { Ref } from "react";

export function assignRef<T = any>(ref: Ref<T> | undefined, value: null | T) {
  if (!ref) return;
  if (typeof ref === "function") {
    try {
      ref(value);
    } catch {}
  } else (ref as React.RefObject<null | T>).current = value;
}

export function caretPosFromDigitsCount(
  formatted: string,
  digitsBefore: number
) {
  if (digitsBefore <= 0) return 0;
  let digitsSeen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) digitsSeen++;
    if (digitsSeen >= digitsBefore) return i + 1;
  }
  return formatted.length;
}
