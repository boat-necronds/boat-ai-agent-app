import type { AttachmentData } from "@workspace/ui/components/ai-elements/attachments";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@workspace/ui/components/ai-elements/attachments";
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
import { SpeechInput } from "@workspace/ui/components/ai-elements/speech-input";
import { Suggestion } from "@workspace/ui/components/ai-elements/suggestion";
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
import type { PromptInputMessage } from "@workspace/ui/components/ai-elements/prompt-input";
import type { AgentItem } from "@/actions/agents";
import { Badge } from "@workspace/ui/components/badge";
import { Bot, CheckIcon, ChevronDownIcon, LightbulbIcon } from "lucide-react";
import { useCallback } from "react";

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

export const PromptInputAttachmentsDisplay = () => {
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

type ChatPromptSectionProps = {
  tips: string[];
  suggestions: string[];
  guideOpen: boolean;
  setGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  status: "ready" | "submitted" | "streaming" | "error";
  isSubmitDisabled: boolean;
  selectedAgent: AgentItem | null;
  agents: AgentItem[];
  selectedAgentId: string | null;
  agentSelectorOpen: boolean;
  setAgentSelectorOpen: (v: boolean) => void;
  handleAgentSelect: (id: string) => void;
  onSubmit: (message: PromptInputMessage) => void;
  onSuggestionClick: (suggestion: string) => void;
  onTranscriptionChange: (transcript: string) => void;
};

export function ChatPromptSection({
  tips,
  suggestions,
  guideOpen,
  setGuideOpen,
  text,
  setText,
  status,
  isSubmitDisabled,
  selectedAgent,
  agents,
  selectedAgentId,
  agentSelectorOpen,
  setAgentSelectorOpen,
  handleAgentSelect,
  onSubmit,
  onSuggestionClick,
  onTranscriptionChange,
}: ChatPromptSectionProps) {
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value),
    [setText],
  );
  const handleTranscriptionInternal = useCallback(
    (transcript: string) =>
      onTranscriptionChange(transcript),
    [onTranscriptionChange],
  );

  return (
    <div className="grid shrink-0 gap-4 pt-4">
      <div className="px-4">
        <button
          type="button"
          onClick={() => setGuideOpen((o: boolean) => !o)}
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
              {tips.map((tip, i) => (
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
            onClick={onSuggestionClick}
            suggestion={suggestion}
          />
        ))}
      </div>
      <div className="w-full px-4 pb-4">
        <PromptInput globalDrop multiple onSubmit={onSubmit}>
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
                            onSelect={() => isActive && handleAgentSelect(a.id)}
                            value={a.name}
                          >
                            <ModelSelectorName>{a.name}</ModelSelectorName>
                            <Badge
                              className="ml-1 shrink-0"
                              variant={isActive ? "default" : "secondary"}
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
              <SpeechInput
                className="shrink-0"
                onTranscriptionChange={handleTranscriptionInternal}
                size="icon-sm"
                variant="ghost"
              />
            </PromptInputTools>
            <PromptInputSubmit disabled={isSubmitDisabled} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

