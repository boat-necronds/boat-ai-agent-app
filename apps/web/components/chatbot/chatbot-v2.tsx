"use client";

import { getAgentsAction, type AgentItem } from "@/actions/agents";
import { Badge } from "@workspace/ui/components/badge";
import { Bot } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  DEFAULT_GUIDE_TIPS,
  DEFAULT_SUGGESTIONS,
  GUIDE_TIPS_BY_SLUG,
  SUGGESTIONS_BY_SLUG,
} from "./chatbot-config";
import { CloudflareChatContent } from "./chatbot-cloudflare-content";
import { ProxyChatContent } from "./chatbot-proxy-content";

type ChatbotV2Props = {
  initialAgents?: AgentItem[];
};

export default function ChatbotV2({ initialAgents = [] }: ChatbotV2Props) {
  const [text, setText] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);
  const [agents, setAgents] = useState<AgentItem[]>(initialAgents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(() => {
    const firstActive = initialAgents.find((a) => a.status === "active");
    return firstActive?.id ?? initialAgents[0]?.id ?? null;
  });

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

  const tips = useMemo(
    () =>
      [...(GUIDE_TIPS_BY_SLUG[selectedAgent?.slug ?? ""] ?? DEFAULT_GUIDE_TIPS)],
    [selectedAgent?.slug],
  );

  const suggestions = useMemo(
    () =>
      [...(SUGGESTIONS_BY_SLUG[selectedAgent?.slug ?? ""] ?? DEFAULT_SUGGESTIONS)],
    [selectedAgent?.slug],
  );

  const handleAgentSelect = useCallback(
    (agentId: string) => {
      setSelectedAgentId(agentId);
      setAgentSelectorOpen(false);
    },
    [],
  );

  const isCloudflare =
    selectedAgent?.chatTransport === "cloudflare";

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
      {isCloudflare && selectedAgent ? (
        <CloudflareChatContent
          key={`cloudflare-${selectedAgentId}`}
          selectedAgent={selectedAgent}
          agents={agents}
          selectedAgentId={selectedAgentId}
          agentSelectorOpen={agentSelectorOpen}
          setAgentSelectorOpen={setAgentSelectorOpen}
          handleAgentSelect={handleAgentSelect}
          tips={tips}
          suggestions={suggestions}
          guideOpen={guideOpen}
          setGuideOpen={setGuideOpen}
          text={text}
          setText={setText}
        />
      ) : (
        <ProxyChatContent
          key={`proxy-${selectedAgentId ?? "none"}`}
          selectedAgentId={selectedAgentId}
          selectedAgent={selectedAgent}
          agents={agents}
          agentSelectorOpen={agentSelectorOpen}
          setAgentSelectorOpen={setAgentSelectorOpen}
          handleAgentSelect={handleAgentSelect}
          tips={tips}
          suggestions={suggestions}
          guideOpen={guideOpen}
          setGuideOpen={setGuideOpen}
          text={text}
          setText={setText}
        />
      )}
    </div>
  );
}