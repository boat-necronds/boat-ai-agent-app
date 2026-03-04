import { getAgentsAction } from "@/actions/agents";
import Chatbot from "@/components/chatbot/chatbot-v2";

/**
 * หน้าแชทรวมเดียว — รองรับทั้ง agent แบบ proxy (AI SDK) และ Cloudflare Worker
 * ใช้ useChat + /api/agents/[id]/chat ทุก agent
 */
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
