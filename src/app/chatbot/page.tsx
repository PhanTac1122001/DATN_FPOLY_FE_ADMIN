import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ChatbotClientView } from "@/views/chatbot/chatbot-client-view";

export const metadata: Metadata = {
    title: UI_TEXT.chatbot.title,
    description: UI_TEXT.chatbot.subtitle,
};

export default function ChatbotPage() {
    return <ChatbotClientView />;
}
