import type { CoachChatRequest, CoachChatResponse, CoachConversation, CoachConversationMessages } from "../types/coach";

export const getConversations = async (accessToken: string): Promise<CoachConversation[]> => {

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/coach/conversations`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
    }

    const data: CoachConversation[] = await response.json();

    return data;
}

export const getConversation = async (
    accessToken: string,
    conversationId: string
): Promise<CoachConversationMessages> => {
    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/coach/conversations/${conversationId}/messages`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch current conversation: ${response.status}`);
    }

    const data: CoachConversationMessages = await response.json();

    return data;
}

export const chatWithCoach = async (
    accessToken: string,
    conversationId: string | null,
    message: string
) : Promise<CoachChatResponse> => {
    
    const payload : CoachChatRequest = {
        message: message,
        conversation_id: conversationId
    }

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/coach/chat`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to chat with coach: ${response.status}`);
    }

    const data: CoachChatResponse = await response.json();

    return data;
}