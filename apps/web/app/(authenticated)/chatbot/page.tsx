import { getAgentsAction } from "@/actions/agents";
import Chatbot from "@/components/chatbot/chatbot";

export default async function ChatbotPage() {
  const result = await getAgentsAction();
  const initialAgents =
    result?.data?.success && result.data.agents
      ? result.data.agents
      : undefined;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Chatbot initialAgents={initialAgents} />
    </div>
  );
}
