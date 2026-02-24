"use client";

import type { PromptInputMessage } from "@workspace/ui/components/ai-elements/prompt-input";
import type { ToolUIPart } from "ai";
import { getToolName, isToolUIPart } from "ai";
import type { UIMessage } from "ai";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import { useAgent } from "agents/react";
import type { AttachmentData } from "@workspace/ui/components/ai-elements/attachments";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@workspace/ui/components/ai-elements/attachments";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@workspace/ui/components/ai-elements/conversation";
import {
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
} from "@workspace/ui/components/ai-elements/message";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@workspace/ui/components/ai-elements/model-selector";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@workspace/ui/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@workspace/ui/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@workspace/ui/components/ai-elements/sources";
import { SpeechInput } from "@workspace/ui/components/ai-elements/speech-input";
import { Suggestion } from "@workspace/ui/components/ai-elements/suggestion";
import { getAgentsAction, type AgentItem } from "@/actions/agents";
import { Badge } from "@workspace/ui/components/badge";
import {
  Bot,
  CheckIcon,
  ChevronDownIcon,
  LightbulbIcon,
  Cpu,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface MessageType {
  key: string;
  from: "user" | "assistant";
  sources?: { href: string; title: string }[];
  versions: {
    id: string;
    content: string;
  }[];
  reasoning?: {
    content: string;
    duration: number;
  };
  tools?: {
    name: string;
    description: string;
    status: ToolUIPart["state"];
    parameters: Record<string, unknown>;
    result: string | undefined;
    error: string | undefined;
  }[];
}

const initialMessages: MessageType[] = [];

const GUIDE_TIPS = [
  "Send one topic at a time — one question or command per message for clear, step-by-step answers",
  "Multi-step flows: e.g. save your profile first, then ask for a weekly program",
  "You can send several things in one message, but the reply may be longer or cover multiple parts",
];

const DEFAULT_SUGGESTIONS = [
  "Save my profile: goal to lose fat, 3 days/week, beginner",
  "Design a weekly program for me",
  "Calculate daily calories for 70kg, 175cm, 30 years old, male",
  "Log that I ran 30 minutes today",
  "Remind me to exercise in 2 minutes",
];

const SUGGESTIONS_BY_SLUG: Record<string, string[]> = {
  "fitness-coach": [
    "Save my profile: goal to lose fat, 3 days/week, beginner",
    "Design a weekly program for me",
    "Calculate daily calories for 70kg, 175cm, 30 years old, male",
    "Log that I ran 30 minutes today",
    "Remind me to exercise in 2 minutes",
  ],
  fitness: [
    "Save my profile: goal to lose fat, 3 days/week, beginner",
    "Design a weekly program for me",
    "Calculate daily calories for 70kg, 175cm, 30 years old, male",
    "Log that I ran 30 minutes today",
    "Remind me to exercise in 2 minutes",
  ],
  image: [
    "Draw a sunset over the ocean",
    "Create an image of a cute robot",
    "Generate a minimalist logo for a coffee shop",
  ],
  voice: [
    "Read this aloud: Hello, welcome to the voice agent",
    "Convert to speech: The quick brown fox jumps over the lazy dog",
  ],
  food: [
    "Suggest a balanced meal for today",
    "Calculate calories for my lunch",
    "What are good protein sources?",
    "Meal plan for weight loss",
    "Healthy snacks for office",
  ],
};

function agentMessagesToMessageTypes(
  agentMessages: UIMessage[],
): MessageType[] {
  return agentMessages.map((msg, idx) => {
    const textParts =
      msg.parts?.filter(
        (p): p is { type: "text"; text: string } => p.type === "text",
      ) ?? [];
    const content = textParts.map((p) => p.text).join("");
    const toolParts = msg.parts?.filter(isToolUIPart) ?? [];
    const tools: MessageType["tools"] = toolParts.map((part) => {
      const raw =
        "result" in part && part.result !== undefined
          ? part.result
          : "output" in part &&
              (part as { output?: unknown }).output !== undefined
            ? (part as { output: unknown }).output
            : undefined;
      return {
        name: getToolName(part),
        description: "",
        status: part.state ?? "partial-call",
        parameters: (part as { args?: Record<string, unknown> }).args ?? {},
        result:
          raw !== undefined
            ? typeof raw === "string"
              ? raw
              : JSON.stringify(raw)
            : undefined,
        error: undefined,
      };
    });
    return {
      key: `agent-${msg.role}-${idx}`,
      from: msg.role === "user" ? "user" : "assistant",
      versions: [{ id: nanoid(), content }],
      ...(tools.length > 0 ? { tools } : {}),
    };
  });
}

const AttachmentItem = ({
  attachment,
  onRemove,
}: {
  attachment: AttachmentData;
  onRemove: (id: string) => void;
}) => {
  const handleRemove = useCallback(() => {
    onRemove(attachment.id);
  }, [onRemove, attachment.id]);

  return (
    <Attachment data={attachment} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  );
};

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  const handleRemove = useCallback(
    (id: string) => {
      attachments.remove(id);
    },
    [attachments],
  );

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem
          attachment={attachment}
          key={attachment.id}
          onRemove={handleRemove}
        />
      ))}
    </Attachments>
  );
};

const SuggestionItem = ({
  suggestion,
  onClick,
}: {
  suggestion: string;
  onClick: (suggestion: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onClick(suggestion);
  }, [onClick, suggestion]);

  return <Suggestion onClick={handleClick} suggestion={suggestion} />;
};

type ChatbotProps = {
  initialAgents?: AgentItem[];
};

/** Convert model ID to short label (e.g. @cf/openai/gpt-oss-20b → gpt-oss-20b) */
function modelIdToLabel(id: string): string {
  const segment = id.split("/").pop();
  return segment ?? id;
}

/** Map app slug to Cloudflare Agents SDK agent name (binding name on boat-agent-all) */
function getCfAgentName(slug: string | null | undefined): string {
  if (slug === "image") return "ImageAgent";
  if (slug === "fitness-coach") return "FitnessCoachAgent";
  if (slug === "voice") return "VoiceAgent";
  return "ChatAgent";
}

/** Default model list when agent has no allowedModels (generic / legacy) */
const DEFAULT_MODEL_OPTIONS = [
  "@cf/openai/gpt-oss-20b",
  "@cf/openai/gpt-oss-120b",
  "@cf/meta/llama-4-scout-17b-16e-instruct",
  "@cf/zai-org/glm-4.7-flash",
];

/** Model options per slug when DB has no allowedModels — must match boat-agent-all Worker */
const MODEL_OPTIONS_BY_SLUG: Record<string, string[]> = {
  "fitness-coach": [
    "@cf/openai/gpt-oss-20b",
    "@cf/openai/gpt-oss-120b",
    "@cf/meta/llama-4-scout-17b-16e-instruct",
    "@cf/zai-org/glm-4.7-flash",
  ],
  image: ["@cf/zai-org/glm-4.7-flash"],
  voice: ["@cf/zai-org/glm-4.7-flash"],
};

const DEFAULT_MODEL_BY_SLUG: Record<string, string> = {
  "fitness-coach": "@cf/openai/gpt-oss-20b",
  image: "@cf/zai-org/glm-4.7-flash",
  voice: "@cf/zai-org/glm-4.7-flash",
};

/** Render tool result (image / audio) — same as JobToolResultBlock */
function ToolResultBlock({
  name,
  result,
}: {
  name: string;
  result: string | undefined;
}) {
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
        <pre className="mt-1 overflow-auto whitespace-pre-wrap text-muted-foreground">
          {result}
        </pre>
      </div>
    );
  }
  if (name === "generateImage" && parsed.imageBase64 && !parsed.error) {
    return (
      <div className="mt-2 rounded border overflow-hidden">
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
      <pre className="mt-1 overflow-auto whitespace-pre-wrap text-muted-foreground">
        {result}
      </pre>
    </div>
  );
}

const Example = ({ initialAgents = [] }: ChatbotProps) => {
  const [text, setText] = useState<string>("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [agents, setAgents] = useState<AgentItem[]>(initialAgents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(() => {
    const firstActive = initialAgents.find((a) => a.status === "active");
    return firstActive?.id ?? initialAgents[0]?.id ?? null;
  });
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  useEffect(() => {
    if (initialAgents.length > 0) return;
    getAgentsAction().then((result) => {
      const list = result?.data?.success ? result.data.agents : undefined;
      if (list?.length) {
        setAgents(list);
        const firstActiveId =
          list.find((a) => a.status === "active")?.id ?? list[0]?.id;
        if (firstActiveId) {
          setSelectedAgentId((prev) =>
            prev && list.some((a) => a.id === prev && a.status === "active")
              ? prev
              : firstActiveId,
          );
        }
      }
    });
  }, [initialAgents.length]);

  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return agents[0] ?? null;
    return agents.find((a) => a.id === selectedAgentId) ?? agents[0] ?? null;
  }, [agents, selectedAgentId]);

  const modelOptions = useMemo(() => {
    const fromDb = selectedAgent?.allowedModels ?? [];
    if (fromDb.length > 0) return fromDb;
    const slug = selectedAgent?.slug ?? "";
    return MODEL_OPTIONS_BY_SLUG[slug] ?? DEFAULT_MODEL_OPTIONS;
  }, [selectedAgent?.allowedModels, selectedAgent?.slug]);

  const effectiveModelId = useMemo(() => {
    if (selectedModelId && modelOptions.includes(selectedModelId))
      return selectedModelId;
    const fromDb = selectedAgent?.defaultModel;
    if (fromDb && modelOptions.includes(fromDb)) return fromDb;
    const slug = selectedAgent?.slug ?? "";
    const slugDefault = DEFAULT_MODEL_BY_SLUG[slug];
    if (slugDefault && modelOptions.includes(slugDefault)) return slugDefault;
    return modelOptions[0] ?? null;
  }, [
    selectedModelId,
    selectedAgent?.defaultModel,
    selectedAgent?.slug,
    modelOptions,
  ]);

  const suggestions = useMemo(
    () => SUGGESTIONS_BY_SLUG[selectedAgent?.slug ?? ""] ?? DEFAULT_SUGGESTIONS,
    [selectedAgent?.slug],
  );

  const agent = useAgent({
    agent: getCfAgentName(selectedAgent?.slug),
    host: selectedAgent?.host ?? "",
  });

  const {
    messages: agentMessages,
    sendMessage,
    status: agentStatus,
  } = useAgentChat({
    agent,
    body: () => (effectiveModelId ? { model: effectiveModelId } : {}),
    getInitialMessages: null,
    onToolCall: async (
      event: {
        toolCall: { toolName: string; toolCallId: string };
        addToolOutput?: (arg: {
          toolCallId: string;
          output: unknown;
        }) => void;
      }
    ) => {
      if (
        "addToolOutput" in event &&
        event.toolCall.toolName === "getUserTimezone"
      ) {
        event.addToolOutput?.({
          toolCallId: event.toolCall.toolCallId,
          output: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localTime: new Date().toLocaleTimeString(),
          },
        });
      }
    },
  });

  const status: "submitted" | "streaming" | "ready" | "error" =
    agentStatus === "streaming" || agentStatus === "submitted"
      ? agentStatus
      : agentStatus === "error"
        ? "error"
        : "ready";

  const messages: MessageType[] =
    agentMessages.length > 0
      ? agentMessagesToMessageTypes(agentMessages)
      : initialMessages;

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }
      if (status === "streaming" || status === "submitted") {
        return;
      }

      if (message.files?.length) {
        toast.success("Files attached", {
          description: `${message.files.length} file(s) attached to message`,
        });
      }

      sendMessage({
        role: "user",
        parts: [{ type: "text", text: message.text || "Sent with attachments" }],
      });
      setText("");
    },
    [sendMessage, status],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (status === "streaming" || status === "submitted") {
        return;
      }
      sendMessage({ role: "user", parts: [{ type: "text", text: suggestion }] });
    },
    [sendMessage, status],
  );

  const handleTranscriptionChange = useCallback((transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, []);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [],
  );

  const handleAgentSelect = useCallback(
    (agentId: string, agentsList: AgentItem[]) => {
      const a = agentsList.find((x) => x.id === agentId);
      const allowed = a?.allowedModels ?? [];
      const list =
        allowed.length > 0
          ? allowed
          : (MODEL_OPTIONS_BY_SLUG[a?.slug ?? ""] ?? DEFAULT_MODEL_OPTIONS);
      const defaultModel =
        a?.defaultModel ??
        DEFAULT_MODEL_BY_SLUG[a?.slug ?? ""] ??
        list[0] ??
        null;
      setSelectedAgentId(agentId);
      setSelectedModelId(defaultModel);
      setAgentSelectorOpen(false);
    },
    [],
  );

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
    setModelSelectorOpen(false);
  }, []);

  const isSubmitDisabled = useMemo(
    () =>
      !selectedAgent ||
      selectedAgent.status !== "active" ||
      !text.trim() ||
      status === "streaming" ||
      status === "submitted",
    [selectedAgent, text, status],
  );

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden">
      <header className="shrink-0 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-5 shrink-0 text-primary" />
          <h1 className="text-lg font-semibold">
            {selectedAgent?.name ?? "Chat with Agent"}
          </h1>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {selectedAgent?.description ??
            "Select an agent from the dropdown and start the conversation"}
        </p>
      </header>
      <Conversation>
        <ConversationContent>
          {messages.map(({ versions, ...message }) => (
            <MessageBranch defaultBranch={0} key={message.key}>
              <MessageBranchContent>
                {versions.map((version) => (
                  <Message
                    from={message.from}
                    key={`${message.key}-${version.id}`}
                  >
                    <div>
                      {message.sources?.length && (
                        <Sources>
                          <SourcesTrigger count={message.sources.length} />
                          <SourcesContent>
                            {message.sources.map((source) => (
                              <Source
                                href={source.href}
                                key={source.href}
                                title={source.title}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}
                      {message.reasoning && (
                        <Reasoning duration={message.reasoning.duration}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {message.reasoning.content}
                          </ReasoningContent>
                        </Reasoning>
                      )}
                      <MessageContent>
                        <MessageResponse>{version.content}</MessageResponse>
                        {message.tools?.map((tool) => (
                          <ToolResultBlock
                            key={tool.name}
                            name={tool.name}
                            result={tool.result}
                          />
                        ))}
                      </MessageContent>
                    </div>
                  </Message>
                ))}
              </MessageBranchContent>
              {versions.length > 1 && (
                <MessageBranchSelector>
                  <MessageBranchPrevious />
                  <MessageBranchPage />
                  <MessageBranchNext />
                </MessageBranchSelector>
              )}
            </MessageBranch>
          ))}
          {(status === "submitted" || status === "streaming") && (
            <MessageBranch defaultBranch={0} key="thinking">
              <MessageBranchContent>
                <Message from="assistant" key="thinking-msg">
                  <MessageContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className="inline-flex gap-0.5 tabular-nums"
                        aria-hidden
                      >
                        <span
                          className="animate-pulse"
                          style={{ animationDelay: "0ms" }}
                        >
                          .
                        </span>
                        <span
                          className="animate-pulse"
                          style={{ animationDelay: "200ms" }}
                        >
                          .
                        </span>
                        <span
                          className="animate-pulse"
                          style={{ animationDelay: "400ms" }}
                        >
                          .
                        </span>
                      </span>
                      <span>Thinking...</span>
                    </div>
                  </MessageContent>
                </Message>
              </MessageBranchContent>
            </MessageBranch>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="grid shrink-0 gap-4 pt-4">
        <div className="px-4">
          <button
            type="button"
            onClick={() => setGuideOpen((o) => !o)}
            className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-expanded={guideOpen}
          >
            <LightbulbIcon className="size-4 shrink-0 text-amber-500" />
            <span>Tips for best results</span>
            <ChevronDownIcon
              className={`ml-auto size-4 shrink-0 text-zinc-400 transition-transform ${guideOpen ? "rotate-180" : ""}`}
            />
          </button>
          {guideOpen && (
            <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900/80">
              <ul className="list-inside list-disc space-y-1 text-zinc-600 dark:text-zinc-400">
                {GUIDE_TIPS.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
              <p className="mt-2 font-medium text-zinc-700 dark:text-zinc-300">
                Example questions
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
          {suggestions.map((suggestion) => (
            <SuggestionItem
              key={suggestion}
              onClick={handleSuggestionClick}
              suggestion={suggestion}
            />
          ))}
        </div>
        <div className="w-full px-4 pb-4">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachmentsDisplay />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                onChange={handleTextChange}
                placeholder="Type your question or request..."
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <SpeechInput
                  className="shrink-0"
                  onTranscriptionChange={handleTranscriptionChange}
                  size="icon-sm"
                  variant="ghost"
                />
                <ModelSelector
                  onOpenChange={setAgentSelectorOpen}
                  open={agentSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton variant="ghost" size="sm">
                      <Bot className="size-4 shrink-0" />
                      <ModelSelectorName>
                        {selectedAgent?.name ?? "Select agent"}
                      </ModelSelectorName>
                      <ChevronDownIcon className="ml-auto size-4 shrink-0 opacity-50" />
                    </PromptInputButton>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent
                    title="Select Agent"
                    value={selectedAgent?.name}
                  >
                    <ModelSelectorInput placeholder="Search agents..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No agents</ModelSelectorEmpty>
                      <ModelSelectorGroup heading="Agent">
                        {agents.map((a) => {
                          const isActive = a.status === "active";
                          const statusLabel =
                            a.status === "maintenance"
                              ? "Maintenance"
                              : isActive
                                ? "Active"
                                : "Inactive";
                          return (
                            <ModelSelectorItem
                              key={a.id}
                              disabled={!isActive}
                              onSelect={() =>
                                isActive && handleAgentSelect(a.id, agents)
                              }
                              value={a.name}
                            >
                              <ModelSelectorName>{a.name}</ModelSelectorName>
                              <Badge
                                className="ml-1 shrink-0"
                                variant={
                                  isActive ? "default" : "secondary"
                                }
                              >
                                {statusLabel}
                              </Badge>
                              {selectedAgentId === a.id ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : (
                                <div className="ml-auto size-4" />
                              )}
                            </ModelSelectorItem>
                          );
                        })}
                      </ModelSelectorGroup>
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton variant="ghost" size="sm">
                      <Cpu className="size-4 shrink-0" />
                      <ModelSelectorName>
                        {effectiveModelId
                          ? modelIdToLabel(effectiveModelId)
                          : "Select model"}
                      </ModelSelectorName>
                      <ChevronDownIcon className="ml-auto size-4 shrink-0 opacity-50" />
                    </PromptInputButton>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent
                    title="Select Model"
                    value={effectiveModelId ?? ""}
                  >
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models</ModelSelectorEmpty>
                      <ModelSelectorGroup heading="Model">
                        {modelOptions.map((modelId) => (
                          <ModelSelectorItem
                            key={modelId}
                            onSelect={() => handleModelSelect(modelId)}
                            value={modelId}
                          >
                            <ModelSelectorName>
                              {modelIdToLabel(modelId)}
                            </ModelSelectorName>
                            {effectiveModelId === modelId ? (
                              <CheckIcon className="ml-auto size-4" />
                            ) : (
                              <div className="ml-auto size-4" />
                            )}
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorGroup>
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>
              <PromptInputSubmit disabled={isSubmitDisabled} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default Example;
