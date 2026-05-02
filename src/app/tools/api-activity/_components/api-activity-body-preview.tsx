import {
  Kind,
  type OperationDefinitionNode,
  parse,
  print,
  type TypeNode,
  type ValueNode,
  visit,
} from "graphql";

import { ApiActivityCopyButton } from "@/app/tools/api-activity/_components/api-activity-copy-button";
import { ApiActivityJsonTreePreview } from "@/app/tools/api-activity/_components/api-activity-json-tree-preview";

import type { ApiActivityJsonTreeValue } from "@/app/tools/api-activity/_components/api-activity-json-tree-types";
import type { ApiActivityBody } from "@/lib/api-activity/api-activity-types";

const STRING_LIKE_SCALAR_NAMES = new Set([
  "Date",
  "DateTime",
  "DateTimeTz",
  "Email",
  "HTML",
  "ID",
  "JSON",
  "JSONObject",
  "PhoneNumber",
  "String",
  "Time",
  "URI",
  "URL",
  "UUID",
]);

export function ApiActivityBodyPreview({
  body,
  preferInlineGraphql = false,
  title,
}: {
  body: ApiActivityBody | null;
  preferInlineGraphql?: boolean;
  title: string;
}) {
  const previewContent = getPreviewContent({
    body,
    preferInlineGraphql,
  });
  const sizeBadges = getBodySizeBadges(body);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          {body?.contentType ? (
            <span className="bg-label-info text-text-secondary rounded-full px-2.5 py-1 text-xs">
              {body.contentType}
            </span>
          ) : null}
          {sizeBadges.map((label) => (
            <span
              className="bg-label-info text-text-secondary rounded-full px-2.5 py-1 text-xs"
              key={label}
            >
              {label}
            </span>
          ))}
          {body?.truncated ? (
            <span className="bg-label-warning text-text-danger rounded-full px-2.5 py-1 text-xs">
              Truncated
            </span>
          ) : null}
        </div>
      </div>

      {previewContent ? (
        <div className="space-y-3">
          {previewContent.formattedPreview ? (
            <PreviewBlock
              jsonTreeValue={previewContent.jsonTreeValue}
              text={previewContent.formattedPreview}
              title={previewContent.formattedPreviewTitle}
            />
          ) : null}
          {previewContent.rawPreview ? (
            <PreviewBlock
              text={previewContent.rawPreview}
              title={previewContent.rawPreviewTitle}
            />
          ) : null}
        </div>
      ) : (
        <div className="border-border-divider bg-bg-surface rounded-xl border">
          <div className="text-text-secondary p-4 text-sm">
            {body?.note ?? "No body recorded."}
          </div>
        </div>
      )}
    </section>
  );
}

function canUseEnumLiterals(typeNode: TypeNode | undefined) {
  const namedType = getNamedType(typeNode);

  if (!namedType) {
    return true;
  }

  return !STRING_LIKE_SCALAR_NAMES.has(namedType);
}

function formatBodySize(size: number) {
  return `${size} bytes`;
}

function getBodySizeBadges(body: ApiActivityBody | null) {
  if (!body) {
    return [];
  }

  if (body.truncated) {
    if (
      body.previewSize != null &&
      body.totalSize != null &&
      body.previewSize < body.totalSize
    ) {
      return [
        `Shown ${formatBodySize(body.previewSize)}`,
        `Original ${formatBodySize(body.totalSize)}`,
      ];
    }

    if (body.previewSize != null) {
      return [
        `Shown ${formatBodySize(body.previewSize)}`,
        `Original > ${formatBodySize(body.previewSize)}`,
      ];
    }
  }

  if (body.totalSize != null) {
    return [formatBodySize(body.totalSize)];
  }

  if (body.previewSize != null) {
    return [`Shown ${formatBodySize(body.previewSize)}`];
  }

  return [];
}

function getFormattedJsonPreview(preview: string) {
  try {
    const parsedPreview = JSON.parse(preview) as unknown;

    return {
      text: JSON.stringify(parsedPreview, null, 2),
      treeValue:
        parsedPreview != null &&
        typeof parsedPreview === "object" &&
        (Array.isArray(parsedPreview) ||
          Object.getPrototypeOf(parsedPreview) === Object.prototype)
          ? (parsedPreview as ApiActivityJsonTreeValue)
          : null,
    };
  } catch {
    return null;
  }
}

function getInlinedGraphqlPreview(preview: string) {
  try {
    const parsedPreview = JSON.parse(preview) as {
      query?: string;
      variables?: Record<string, unknown>;
    };

    if (typeof parsedPreview.query !== "string") {
      return null;
    }

    return inlineGraphqlVariables(
      parsedPreview.query,
      isVariablesObject(parsedPreview.variables) ? parsedPreview.variables : {}
    );
  } catch {
    return null;
  }
}

function getNamedType(typeNode: TypeNode | undefined): null | string {
  if (!typeNode) {
    return null;
  }

  if (typeNode.kind === Kind.NAMED_TYPE) {
    return typeNode.name.value;
  }

  return getNamedType(typeNode.type);
}

function getPreviewContent({
  body,
  preferInlineGraphql,
}: {
  body: ApiActivityBody | null;
  preferInlineGraphql: boolean;
}) {
  if (!body?.preview) {
    return null;
  }

  if (preferInlineGraphql) {
    const formattedGraphqlPreview = getInlinedGraphqlPreview(body.preview);

    return {
      formattedPreview: formattedGraphqlPreview,
      formattedPreviewTitle: "Postman-ready query",
      jsonTreeValue: null,
      rawPreview: body.preview,
      rawPreviewTitle: formattedGraphqlPreview
        ? "Original request body"
        : "Body preview",
    };
  }

  const formattedJsonPreview = getFormattedJsonPreview(body.preview);

  return {
    formattedPreview: formattedJsonPreview?.text ?? null,
    formattedPreviewTitle: "Formatted JSON",
    jsonTreeValue: formattedJsonPreview?.treeValue ?? null,
    rawPreview: formattedJsonPreview ? null : body.preview,
    rawPreviewTitle: "Body preview",
  };
}

function getVariableTypeMap(definitions: readonly OperationDefinitionNode[]) {
  const variableTypeMap = new Map<string, TypeNode>();

  for (const definition of definitions) {
    for (const variableDefinition of definition.variableDefinitions ?? []) {
      variableTypeMap.set(
        variableDefinition.variable.name.value,
        variableDefinition.type
      );
    }
  }

  return variableTypeMap;
}

function hasVariableValue(
  variables: Record<string, unknown>,
  variableName: string
) {
  return Object.hasOwn(variables, variableName);
}

function inlineGraphqlVariables(
  query: string,
  variables: Record<string, unknown>
) {
  try {
    const documentNode = parse(query);
    const operationDefinitions = documentNode.definitions.filter(
      (definition): definition is OperationDefinitionNode =>
        definition.kind === Kind.OPERATION_DEFINITION
    );
    const variableTypeMap = getVariableTypeMap(operationDefinitions);
    const transformedDocumentNode = visit(documentNode, {
      Argument: {
        leave(node) {
          return isMissingVariableNode(node.value, variables)
            ? null
            : undefined;
        },
      },
      ListValue: {
        leave(node) {
          const values = node.values.filter(
            (value) => !isMissingVariableNode(value, variables)
          );

          return values.length === node.values.length
            ? undefined
            : { ...node, values };
        },
      },
      ObjectField: {
        leave(node) {
          return isMissingVariableNode(node.value, variables)
            ? null
            : undefined;
        },
      },
      OperationDefinition(node) {
        return node.variableDefinitions?.length
          ? { ...node, variableDefinitions: [] }
          : undefined;
      },
      Variable(node) {
        if (!hasVariableValue(variables, node.name.value)) {
          return undefined;
        }

        return toGraphqlValueNode(variables[node.name.value], {
          allowEnumLiterals: canUseEnumLiterals(
            variableTypeMap.get(node.name.value)
          ),
        });
      },
    });

    return print(transformedDocumentNode).trim();
  } catch {
    return null;
  }
}

function isMissingVariableNode(
  valueNode: ValueNode,
  variables: Record<string, unknown>
) {
  return (
    valueNode.kind === Kind.VARIABLE &&
    !hasVariableValue(variables, valueNode.name.value)
  );
}

function isVariablesObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function looksLikeEnumLiteral(value: string) {
  return /^[A-Z][A-Z0-9_]*$/.test(value);
}

function PreviewBlock({
  jsonTreeValue,
  text,
  title,
}: {
  jsonTreeValue?: ApiActivityJsonTreeValue | null;
  text: string;
  title: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-text-secondary text-xs font-medium uppercase tracking-[0.18em]">
          {title}
        </h4>
        <ApiActivityCopyButton text={text} />
      </div>

      <div className="border-border-divider bg-bg-surface rounded-xl border">
        {jsonTreeValue ? (
          <ApiActivityJsonTreePreview
            cacheKey={`${title}:${text}`}
            value={jsonTreeValue}
          />
        ) : (
          <pre className="wrap-break-word max-h-96 select-text overflow-auto whitespace-pre-wrap p-4 font-mono text-[11px] leading-6">
            {text}
          </pre>
        )}
      </div>
    </div>
  );
}

function toGraphqlValueNode(
  value: unknown,
  options: {
    allowEnumLiterals: boolean;
  }
): ValueNode {
  if (value == null) {
    return {
      kind: Kind.NULL,
    };
  }

  if (typeof value === "boolean") {
    return {
      kind: Kind.BOOLEAN,
      value,
    };
  }

  if (typeof value === "number") {
    return {
      kind: Number.isInteger(value) ? Kind.INT : Kind.FLOAT,
      value: String(value),
    };
  }

  if (typeof value === "string") {
    if (options.allowEnumLiterals && looksLikeEnumLiteral(value)) {
      return {
        kind: Kind.ENUM,
        value,
      };
    }

    return {
      kind: Kind.STRING,
      value,
    };
  }

  if (Array.isArray(value)) {
    return {
      kind: Kind.LIST,
      values: value.map((item) => toGraphqlValueNode(item, options)),
    };
  }

  return {
    fields: Object.entries(value).map(([key, itemValue]) => ({
      kind: Kind.OBJECT_FIELD,
      name: {
        kind: Kind.NAME,
        value: key,
      },
      value: toGraphqlValueNode(itemValue, options),
    })),
    kind: Kind.OBJECT,
  };
}
