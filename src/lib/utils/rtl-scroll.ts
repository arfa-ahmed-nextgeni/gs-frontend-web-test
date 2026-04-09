const rtlScrollTypeCache = new WeakMap<Document, RtlScrollType>();

type RtlScrollType = "default" | "negative" | "reverse";

export function getScrollOffsetFromStart(element: HTMLElement) {
  if (getScrollDirection(element) !== "rtl") {
    return element.scrollLeft;
  }

  const maxScrollOffset = getMaxScrollOffset(element);

  switch (getRtlScrollType(element.ownerDocument)) {
    case "negative":
      return Math.abs(element.scrollLeft);
    case "reverse":
      return element.scrollLeft;
    default:
      return maxScrollOffset - element.scrollLeft;
  }
}

export function scrollToOffsetFromStart(
  element: HTMLElement,
  offsetFromStart: number,
  options: Pick<ScrollToOptions, "behavior">
) {
  element.scrollTo({
    behavior: options.behavior,
    left: toNativeScrollLeft(element, offsetFromStart),
  });
}

function detectRtlScrollType(document: Document): RtlScrollType {
  const dummy = document.createElement("div");
  const child = document.createElement("div");

  dummy.dir = "rtl";
  dummy.style.position = "absolute";
  dummy.style.top = "-9999px";
  dummy.style.width = "4px";
  dummy.style.height = "1px";
  dummy.style.overflow = "scroll";
  child.style.width = "8px";
  child.style.height = "1px";

  dummy.appendChild(child);
  document.body.appendChild(dummy);

  if (dummy.scrollLeft > 0) {
    document.body.removeChild(dummy);
    return "default";
  }

  dummy.scrollLeft = 1;

  const scrollType = dummy.scrollLeft === 0 ? "negative" : "reverse";

  document.body.removeChild(dummy);

  return scrollType;
}

function getMaxScrollOffset(element: HTMLElement) {
  return Math.max(0, element.scrollWidth - element.clientWidth);
}

function getRtlScrollType(document: Document) {
  const cachedType = rtlScrollTypeCache.get(document);

  if (cachedType) {
    return cachedType;
  }

  const nextType = detectRtlScrollType(document);

  rtlScrollTypeCache.set(document, nextType);

  return nextType;
}

function getScrollDirection(element: HTMLElement) {
  return (
    element.ownerDocument.defaultView?.getComputedStyle(element).direction ??
    "ltr"
  );
}

function toNativeScrollLeft(element: HTMLElement, offsetFromStart: number) {
  if (getScrollDirection(element) !== "rtl") {
    return offsetFromStart;
  }

  const maxScrollOffset = getMaxScrollOffset(element);

  switch (getRtlScrollType(element.ownerDocument)) {
    case "negative":
      return -offsetFromStart;
    case "reverse":
      return offsetFromStart;
    default:
      return maxScrollOffset - offsetFromStart;
  }
}
