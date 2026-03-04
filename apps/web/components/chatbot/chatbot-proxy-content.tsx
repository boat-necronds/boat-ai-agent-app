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
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { MessageSquare } from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { AgentItem } from "@/actions/agents";
import { ChatPromptSection } from "./chatbot-shared-ui";
import { MessageParts } from "./chatbot-tool-parts";

type ProxyChatContentProps = {
  selectedAgentId: string | null;
  selectedAgent: AgentItem | null;
  agents: AgentItem[];
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

export function ProxyChatContent({
  selectedAgentId,
  selectedAgent,
  agents,
  agentSelectorOpen,
  setAgentSelectorOpen,
  handleAgentSelect,
  tips,
  suggestions,
  guideOpen,
  setGuideOpen,
  text,
  setText,
}: ProxyChatContentProps) {
  const chatApi = selectedAgentId
    ? `/api/agents/${selectedAgentId}/chat`
    : "";
  const { messages, sendMessage, status, addToolApprovalResponse } = useChat({
    transport: new DefaultChatTransport({ api: chatApi }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const isSubmitDisabled = useMemo(
    () =>
      !selectedAgent ||
      selectedAgent.status !== "active" ||
      !text.trim() ||
      status === "streaming" ||
      status === "submitted",
    [selectedAgent, text, status],
  );

  const displayStatus: "ready" | "submitted" | "streaming" | "error" =
    status === "streaming" || status === "submitted"
      ? status
      : status === "error"
        ? "error"
        : "ready";

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!(message.text?.trim() || message.files?.length)) return;
      if (displayStatus === "streaming" || displayStatus === "submitted")
        return;
      if (message.files?.length) {
        toast.success("Files attached", {
          description: `${message.files.length} file(s) attached to message`,
        });
      }
      sendMessage({ text: message.text || "Sent with attachments" });
      setText("");
    },
    [sendMessage, displayStatus, setText],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (displayStatus === "streaming" || displayStatus === "submitted")
        return;
      sendMessage({ text: suggestion });
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
                        <MessageParts
                          parts={parts}
                          addToolApprovalResponse={addToolApprovalResponse}
                        />
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

