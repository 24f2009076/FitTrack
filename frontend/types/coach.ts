export interface CoachConversation {
    id: string;
    title: string | null;
    updated_at: string;
}

export interface CoachMessage {
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

export interface CoachConversationMessages {
    conversation_id: string;
    title: string | null;
    messages: CoachMessage[];
}

export interface CoachChatRequest {
    message: string;
    conversation_id?: string | null;
}

export interface CoachChatResponse {
    message: string;
    conversation_id: string;
}