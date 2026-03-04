import type { PromptInputMessage } from "@workspace/ui/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@workspace/ui/components/ai-elements/conversation";
import {
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageContent,
} from "@workspace/ui/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@workspace/ui/components/ai-elements/reasoning";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import { useAgent } from "agents/react";
import { MessageSquare } from "lucide-react";
import { useCallback, useMemo } from "react";
import type { AgentItem } from "@/actions/agents";
import { ChatPromptSection } from "./chatbot-shared-ui";
import { MessageParts } from "./chatbot-tool-parts";
import { getCfAgentName } from "./chatbot-config";

type CloudflareChatContentProps = {
  selectedAgent: AgentItem;
  agents: AgentItem[];
  selectedAgentId: string | null;
  agentSelectorOpen: boolean;
  setAgentSelectorOpen: (v: boolean) => void;
  handleAgentSelect: (id: string) => void;
  tips: string[];
  suggestions: string[];
  guideOpen: boolean;
  setGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
};

export function CloudflareChatContent({
  selectedAgent,
  agents,
  selectedAgentId,
  agentSelectorOpen,
  setAgentSelectorOpen,
  handleAgentSelect,
  tips,
  suggestions,
  guideOpen,
  setGuideOpen,
  text,
  setText,
}: CloudflareChatContentProps) {
  const agent = useAgent({
    agent: getCfAgentName(selectedAgent.slug),
    host: selectedAgent.host ?? "",
  });
  const {
    messages,
    sendMessage,
    status,
  } = useAgentChat({
    agent,
    body: () =>
      selectedAgent.defaultModel
        ? { model: selectedAgent.defaultModel }
        : {},
    getInitialMessages: null,
    onToolCall: async (event: {
      toolCall: { toolName: string; toolCallId: string };
      addToolOutput?: (arg: { toolCallId: string; output: unknown }) => void;
    }) => {
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

  const displayStatus: "ready" | "submitted" | "streaming" | "error" =
    status === "streaming" || status === "submitted"
      ? status
      : status === "error"
        ? "error"
        : "ready";

  const isSubmitDisabled =
    !text.trim() ||
    displayStatus === "streaming" ||
    displayStatus === "submitted";

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!message.text?.trim()) return;
      if (displayStatus === "streaming" || displayStatus === "submitted")
        return;
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: message.text || "" }],
      });
      setText("");
    },
    [sendMessage, displayStatus, setText],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (displayStatus === "streaming" || displayStatus === "submitted")
        return;
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: suggestion }],
      });
    },
    [sendMessage, displayStatus],
  );

  const handleTranscriptionChange = useCallback(
    (transcript: string) =>
      setText((prev: string) => (prev ? `${prev} ${transcript}` : transcript)),
    [setText],
  );

  const promptStatus = useMemo<"ready" | "submitted" | "streaming" | "error">(
    () => displayStatus,
    [displayStatus],
  );

  return (
    <>
      <Conversation>
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          )}
          {messages.map((message) => {
            const from =
              message.role === "user" ? "user" : "assistant";
            const parts = message.parts ?? [];
            return (
              <MessageBranch defaultBranch={0} key={message.id}>
                <MessageBranchContent>
                  <Message from={from}>
                    <div>
                      <MessageContent>
                        <MessageParts parts={parts} />
                      </MessageContent>
                    </div>
                  </Message>
                </MessageBranchContent>
              </MessageBranch>
            );
          })}
          {(displayStatus === "submitted" || displayStatus === "streaming") && (
            <MessageBranch defaultBranch={0} key="reasoning">
              <MessageBranchContent>
                <Message from="assistant" key="reasoning-msg">
                  <MessageContent>
                    <Reasoning className="w-full" isStreaming>
                      <ReasoningTrigger />
                      <ReasoningContent>{""}</ReasoningContent>
                    </Reasoning>
                  </MessageContent>
                </Message>
              </MessageBranchContent>
            </MessageBranch>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <ChatPromptSection
        tips={tips}
        suggestions={suggestions}
        guideOpen={guideOpen}
        setGuideOpen={setGuideOpen}
        text={text}
        setText={setText}
        status={promptStatus}
        isSubmitDisabled={isSubmitDisabled}
        selectedAgent={selectedAgent}
        agents={agents}
        selectedAgentId={selectedAgentId}
        agentSelectorOpen={agentSelectorOpen}
        setAgentSelectorOpen={setAgentSelectorOpen}
        handleAgentSelect={handleAgentSelect}
        onSubmit={handleSubmit}
        onSuggestionClick={handleSuggestionClick}
        onTranscriptionChange={handleTranscriptionChange}
      />
    </>
  );
}

