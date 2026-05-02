"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  ApiActivityJsonTreeValue,
  ApiActivityJsonValue,
} from "@/app/tools/api-activity/_components/api-activity-json-tree-types";

const INDENT_SIZE_REM = 1.125;
const ROOT_PATH = "$";

type JsonLineCounter = {
  value: number;
};

type JsonTreeEntry = {
  label?: string;
  path: string;
  value: ApiActivityJsonValue;
};

export function ApiActivityJsonTreePreview({
  cacheKey,
  value,
}: {
  cacheKey: string;
  value: ApiActivityJsonTreeValue;
}) {
  const [openPaths, setOpenPaths] = useState<Set<string>>(() =>
    getDefaultOpenPaths(value)
  );
  const previousCacheKeyReference = useRef(cacheKey);

  useEffect(() => {
    if (previousCacheKeyReference.current === cacheKey) {
      return;
    }

    previousCacheKeyReference.current = cacheKey;
    setOpenPaths(getDefaultOpenPaths(value));
  }, [cacheKey, value]);

  function togglePath(path: string) {
    setOpenPaths((currentOpenPaths) => {
      const nextOpenPaths = new Set(currentOpenPaths);

      if (nextOpenPaths.has(path)) {
        nextOpenPaths.delete(path);
      } else {
        nextOpenPaths.add(path);
      }

      return nextOpenPaths;
    });
  }

  const lineCounter: JsonLineCounter = {
    value: 1,
  };

  return (
    <div className="max-h-96 select-text overflow-auto p-4 font-mono text-[11px] leading-6">
      {renderJsonLines({
        depth: 0,
        isLast: true,
        lineCounter,
        openPaths,
        path: ROOT_PATH,
        togglePath,
        value,
      })}
    </div>
  );
}

function formatJsonValue(value: boolean | null | number | string) {
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

function getCollapsedSummary({
  kind,
  size,
}: {
  kind: "array" | "object";
  size: number;
}) {
  return kind === "array"
    ? `${size} ${size === 1 ? "item" : "items"}`
    : `${size} ${size === 1 ? "key" : "keys"}`;
}

function getDefaultOpenPaths(
  value: ApiActivityJsonTreeValue,
  path = ROOT_PATH
) {
  const openPaths = new Set([path]);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (Array.isArray(item) || isJsonObject(item)) {
        for (const nestedPath of getDefaultOpenPaths(
          item,
          `${path}[${index}]`
        )) {
          openPaths.add(nestedPath);
        }
      }
    });

    return openPaths;
  }

  Object.entries(value).forEach(([entryKey, entryValue]) => {
    if (Array.isArray(entryValue) || isJsonObject(entryValue)) {
      for (const nestedPath of getDefaultOpenPaths(
        entryValue,
        `${path}.${entryKey}`
      )) {
        openPaths.add(nestedPath);
      }
    }
  });

  return openPaths;
}

function getJsonValueClassName(value: boolean | null | number | string) {
  return cn({
    "text-text-accent": typeof value === "string",
    "text-text-primary": typeof value === "number",
    "text-text-secondary": typeof value === "boolean" || value == null,
  });
}

function isJsonObject(
  value: ApiActivityJsonValue
): value is Exclude<ApiActivityJsonTreeValue, ApiActivityJsonValue[]> {
  return value != null && !Array.isArray(value) && typeof value === "object";
}

function JsonTreeLabel({ label }: { label?: string }) {
  if (label == null) {
    return null;
  }

  return (
    <>
      <span className="text-text-primary">&quot;{label}&quot;</span>
      <span>: </span>
    </>
  );
}

function JsonTreeLine({
  content,
  depth,
  isExpanded,
  lineNumber,
  onToggle,
}: {
  content: ReactNode;
  depth: number;
  isExpanded?: boolean;
  lineNumber: number;
  onToggle?: () => void;
}) {
  return (
    <div className="grid grid-cols-[2rem_1rem_minmax(0,1fr)] items-start gap-x-2">
      <span className="text-text-secondary/70 select-none text-right tabular-nums">
        {lineNumber}
      </span>

      {onToggle ? (
        <button
          aria-expanded={isExpanded}
          className="text-text-secondary flex size-4 items-center justify-center pt-1"
          onClick={onToggle}
          type="button"
        >
          {isExpanded ? (
            <ChevronDownIcon className="size-4" />
          ) : (
            <ChevronRightIcon className="size-4" />
          )}
        </button>
      ) : (
        <span className="size-4" />
      )}

      <div
        className="wrap-break-word min-w-0"
        style={{ paddingInlineStart: `${depth * INDENT_SIZE_REM}rem` }}
      >
        {content}
      </div>
    </div>
  );
}

function renderExpandableJsonLines({
  depth,
  entries,
  isLast,
  kind,
  label,
  lineCounter,
  openPaths,
  path,
  togglePath,
}: {
  depth: number;
  entries: JsonTreeEntry[];
  isLast: boolean;
  kind: "array" | "object";
  label?: string;
  lineCounter: JsonLineCounter;
  openPaths: Set<string>;
  path: string;
  togglePath: (path: string) => void;
}) {
  const isOpen = openPaths.has(path);
  const closingToken = kind === "array" ? "]" : "}";
  const openingToken = kind === "array" ? "[" : "{";
  const lines: ReactNode[] = [];

  lines.push(
    <JsonTreeLine
      content={
        <>
          <JsonTreeLabel label={label} />
          <span className="text-text-secondary">
            {isOpen
              ? openingToken
              : `${openingToken}${getCollapsedSummary({
                  kind,
                  size: entries.length,
                })}${closingToken}`}
          </span>
          {!isOpen && !isLast ? "," : null}
        </>
      }
      depth={depth}
      isExpanded={isOpen}
      key={`${path}-open`}
      lineNumber={lineCounter.value++}
      onToggle={() => togglePath(path)}
    />
  );

  if (!isOpen) {
    return lines;
  }

  entries.forEach((entry, index) => {
    lines.push(
      ...renderJsonLines({
        depth: depth + 1,
        isLast: index === entries.length - 1,
        label: entry.label,
        lineCounter,
        openPaths,
        path: entry.path,
        togglePath,
        value: entry.value,
      })
    );
  });

  lines.push(
    <JsonTreeLine
      content={
        <>
          <span className="text-text-secondary">{closingToken}</span>
          {!isLast ? "," : null}
        </>
      }
      depth={depth}
      key={`${path}-close`}
      lineNumber={lineCounter.value++}
    />
  );

  return lines;
}

function renderJsonLines({
  depth,
  isLast,
  label,
  lineCounter,
  openPaths,
  path,
  togglePath,
  value,
}: {
  depth: number;
  isLast: boolean;
  label?: string;
  lineCounter: JsonLineCounter;
  openPaths: Set<string>;
  path: string;
  togglePath: (path: string) => void;
  value: ApiActivityJsonValue;
}) {
  if (Array.isArray(value)) {
    return renderExpandableJsonLines({
      depth,
      entries: value.map((item, index) => ({
        path: `${path}[${index}]`,
        value: item,
      })),
      isLast,
      kind: "array",
      label,
      lineCounter,
      openPaths,
      path,
      togglePath,
    });
  }

  if (isJsonObject(value)) {
    return renderExpandableJsonLines({
      depth,
      entries: Object.entries(value).map(([entryKey, entryValue]) => ({
        label: entryKey,
        path: `${path}.${entryKey}`,
        value: entryValue,
      })),
      isLast,
      kind: "object",
      label,
      lineCounter,
      openPaths,
      path,
      togglePath,
    });
  }

  return [
    <JsonTreeLine
      content={
        <>
          <JsonTreeLabel label={label} />
          <span className={getJsonValueClassName(value)}>
            {formatJsonValue(value)}
          </span>
          {!isLast ? "," : null}
        </>
      }
      depth={depth}
      key={path}
      lineNumber={lineCounter.value++}
    />,
  ];
}
