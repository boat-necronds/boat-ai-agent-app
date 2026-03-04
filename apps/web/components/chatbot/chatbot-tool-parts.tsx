import { MessageResponse } from "@workspace/ui/components/ai-elements/message";

/** Tool part state from AI SDK (input-streaming | input-available | output-available | output-error | approval-requested) */
export type ToolPartState = string;

/** Generic tool part for rendering (typed tool-* or dynamic-tool) */
export type ToolPartLike = {
  type: string;
  toolCallId?: string;
  toolName?: string;
  state?: ToolPartState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  approval?: { id: string };
};

function getToolNameFromPart(part: ToolPartLike): string {
  if (part.type === "dynamic-tool" && part.toolName) return part.toolName;
  if (part.type.startsWith("tool-")) return part.type.replace(/^tool-/, "");
  return "Tool";
}

/** Render tool output (image/audio or JSON/text) — aligned with v1 ToolResultBlock */
function ToolOutputDisplay({
  name,
  output,
}: {
  name: string;
  output: unknown;
}) {
  const result =
    typeof output === "string"
      ? output
      : output !== undefined && output !== null
        ? JSON.stringify(output)
        : "";
  if (!result) return null;

  let parsed: {
    imageBase64?: string;
    mimeType?: string;
    prompt?: string;
    error?: string;
    audio?: string;
    text?: string;
    languageFallback?: string;
  };
  try {
    parsed = JSON.parse(result) as typeof parsed;
  } catch {
    return (
      <div className="mt-2 rounded border bg-muted/50 p-2 text-xs font-mono">
        <span className="font-medium">{name}</span>
        <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap text-muted-foreground">
          {result}
        </pre>
      </div>
    );
  }
  if (name === "generateImage" && parsed.imageBase64 && !parsed.error) {
    return (
      <div className="mt-2 rounded border overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL from tool output */}
        <img
          src={`data:${parsed.mimeType ?? "image/png"};base64,${parsed.imageBase64}`}
          alt={parsed.prompt ?? "Generated image"}
          className="max-w-full h-auto block"
        />
      </div>
    );
  }
  if (name === "textToSpeech" && parsed.audio && !parsed.error) {
    return (
      <div className="mt-2 rounded border bg-muted/30 p-2">
        {parsed.languageFallback && (
          <p className="mb-1 text-xs text-amber-600 dark:text-amber-400">
            {parsed.languageFallback}
          </p>
        )}
        {parsed.text && (
          <p className="mb-1 text-sm text-muted-foreground">
            &quot;{parsed.text}&quot;
          </p>
        )}
        <audio
          controls
          src={`data:${parsed.mimeType ?? "audio/mpeg"};base64,${parsed.audio}`}
          className="w-full max-w-sm"
        />
      </div>
    );
  }
  return (
    <div className="mt-2 rounded border bg-muted/50 p-2 text-xs font-mono">
      <span className="font-medium">{name}</span>
      <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap text-muted-foreground">
        {result}
      </pre>
    </div>
  );
}

/** Renders a single tool part (tool-* or dynamic-tool) with state and optional approval UI */
export function ToolPartBlock({
  part,
  addToolApprovalResponse,
}: {
  part: ToolPartLike;
  addToolApprovalResponse?: (arg: { id: string; approved: boolean }) => void;
}) {
  const toolName = getToolNameFromPart(part);
  const key = part.toolCallId ?? toolName;
  const state = part.state ?? "input-streaming";

  switch (state) {
    case "input-streaming":
      return (
        <div
          key={key}
          className="mt-2 rounded border border-dashed bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground"
        >
          <span className="font-medium">{toolName}</span> — Loading…
        </div>
      );
    case "input-available":
      return (
        <div
          key={key}
          className="mt-2 rounded border bg-muted/30 p-2 text-xs font-mono"
        >
          <span className="font-medium">{toolName}</span>
          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap text-muted-foreground">
            {typeof part.input === "object" && part.input !== null
              ? JSON.stringify(part.input, null, 2)
              : String(part.input ?? "")}
          </pre>
        </div>
      );
    case "approval-requested":
      return (
        <div
          key={key}
          className="mt-2 rounded border border-amber-500/50 bg-amber-500/10 p-2 text-sm"
        >
          <span className="font-medium">{toolName}</span> — Approval requested
          {part.approval?.id && addToolApprovalResponse && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  addToolApprovalResponse({
                    id: part.approval!.id,
                    approved: true,
                  })
                }
                className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:opacity-90"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() =>
                  addToolApprovalResponse({
                    id: part.approval!.id,
                    approved: false,
                  })
                }
                className="rounded border px-2 py-1 text-xs hover:bg-muted"
              >
                Deny
              </button>
            </div>
          )}
        </div>
      );
    case "output-available":
      return (
        <div key={key} className="mt-2">
          <ToolOutputDisplay name={toolName} output={part.output} />
        </div>
      );
    case "output-error":
      return (
        <div
          key={key}
          className="mt-2 rounded border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive"
        >
          <span className="font-medium">{toolName}</span> — {part.errorText ?? "Error"}
        </div>
      );
    default:
      return (
        <div
          key={key}
          className="mt-2 rounded border bg-muted/30 p-2 text-xs text-muted-foreground"
        >
          <span className="font-medium">{toolName}</span> — {state}
        </div>
      );
  }
}

/** Render message parts: text + tool/dynamic-tool (per AI SDK chatbot-tool-usage) */
export function MessageParts({
  parts,
  addToolApprovalResponse,
}: {
  parts: Array<{ type: string; text?: string } & ToolPartLike>;
  addToolApprovalResponse?: (arg: { id: string; approved: boolean }) => void;
}) {
  return (
    <>
      {parts?.map((part, index) => {
        if (part.type === "text") {
          const text = part.text ?? "";
          if (!text) return null;
          return <MessageResponse key={`text-${index}`}>{text}</MessageResponse>;
        }
        if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
          return (
            <ToolPartBlock
              key={part.toolCallId ?? `tool-${index}`}
              part={part as ToolPartLike}
              addToolApprovalResponse={addToolApprovalResponse}
            />
          );
        }
        if (part.type === "step-start") {
          return index > 0 ? (
            <hr
              key={`step-${index}`}
              className="my-2 border-border"
              aria-hidden
            />
          ) : null;
        }
        return null;
      })}
    </>
  );
}

