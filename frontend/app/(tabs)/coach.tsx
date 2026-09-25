import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { chatWithCoach, getConversation, getConversations } from "@/services/coachService";
import { CoachConversation, CoachConversationMessages } from "@/types/coach";
import { styled } from "nativewind";
import React, { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MarkdownDisplay from 'react-native-markdown-display';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const markdownStyles = {
    body: {
        color: "#081126",
        fontSize: 15,
        lineHeight: 22,
    },

    paragraph: {
        marginTop: 0,
        marginBottom: 8,
    },

    strong: {
        fontWeight: "700" as const,
        color: "#081126",
    },

    em: {
        fontStyle: "italic" as const,
    },

    heading1: {
        fontSize: 22,
        fontWeight: "700" as const,
        color: "#081126",
        marginBottom: 8,
    },

    heading2: {
        fontSize: 19,
        fontWeight: "700" as const,
        color: "#081126",
        marginBottom: 6,
    },

    heading3: {
        fontSize: 17,
        fontWeight: "600" as const,
        color: "#081126",
        marginBottom: 6,
    },

    bullet_list: {
        marginVertical: 6,
    },

    ordered_list: {
        marginVertical: 6,
    },

    list_item: {
        marginBottom: 4,
    },

    code_inline: {
        backgroundColor: "#F6EECF",
        color: "#081126",
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },

    blockquote: {
        backgroundColor: "#F6EECF",
        borderLeftWidth: 3,
        borderLeftColor: "#EA7A53",
        paddingLeft: 10,
        paddingVertical: 6,
    },

    link: {
        color: "#EA7A53",
    },
};



const Coach = () => {

    const { session } = useAuth();

    const [query, setQuery] = useState("");
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<CoachConversationMessages>();
    const [messageHistory, setMessageHistory] = useState<CoachConversation[]>([]);
    const [sending, setSending] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleNewChat = () => {
        setCurrentConversationId(null);
        setMessages(undefined);
        setQuery("");
        setMenuOpen(false);
    };

    const handleSend = async () => {
        if (!session || sending) return;

        const message = query.trim();

        if (!message) return;

        setQuery("");

        setMessages((previous) => ({
            conversation_id:
                previous?.conversation_id ??
                currentConversationId ??
                "",
            title: previous?.title ?? null,
            messages: [
                ...(previous?.messages ?? []),
                {
                    role: "user",
                    content: message,
                    created_at: new Date().toISOString(),
                },
            ],
        }));

        try {
            setSending(true);

            const response = await chatWithCoach(
                session.accessToken,
                currentConversationId,
                message
            );

            setCurrentConversationId(
                response.conversation_id
            );

            // Add Coach response
            setMessages((previous) => ({
                conversation_id:
                    response.conversation_id,
                title: previous?.title ?? null,
                messages: [
                    ...(previous?.messages ?? []),
                    {
                        role: "assistant",
                        content: response.message,
                        created_at:
                            new Date().toISOString(),
                    },
                ],
            }));

        } catch (error) {

            setQuery(message);

            console.error(
                "Error sending message:",
                error
            );

        } finally {

            setSending(false);
        }
    };

    useEffect(() => {
        if (!session) return;

        const fetchMessages = async () => {
            try {
                const data = await getConversations(session?.accessToken);
                setMessageHistory(data);
            }
            catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchMessages();
    }, [session?.accessToken]);

    useEffect(() => {
        if (!session?.accessToken || !currentConversationId) return;

        let isActive = true;

        const fetchCurrentConversation = async () => {
            try {
                const data = await getConversation(
                    session.accessToken,
                    currentConversationId
                );

                if (isActive) {
                    setMessages(data);
                }
            } catch (error) {
                console.error("Error fetching current conversation:", error);
            }
        };

        fetchCurrentConversation();

        return () => {
            isActive = false;
        };
    }, [session?.accessToken, currentConversationId]);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages, sending]);




    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="home-navbar px-5">
                <Pressable onPress={() => setMenuOpen(!menuOpen)}>
                    <Image source={icons.hamburgerPrimary} className="size-6" />
                </Pressable>
                <View className="tab-header">
                    <Text className="text-2xl font-sans-bold"> Coach </Text>
                </View>
            </View>

            {menuOpen && (
                <View className="absolute top-18 inset-0 z-50 flex-row">
                    <View className="w-4/5 bg-muted p-5 shadow-lg">
                        <View className="mb-5 flex-row items-center justify-between">
                            <Text className="text-xl font-sans-bold text-primary">
                                Conversations
                            </Text>
                            <Pressable onPress={() => setMenuOpen(false)}>
                                <Image source={icons.closePrimary} className="size-6" />
                            </Pressable>
                        </View>

                        <ScrollView 
                            showsVerticalScrollIndicator={false}>
                                <Pressable 
                                    className="mb-2 rounded-xl p-4 bg-background border-4 border-accent"
                                    onPress={handleNewChat}
                                >
                                    
                                    <Text className="text-lg text-center font-sans-semibold text-accent">
                                        New chat
                                    </Text>
                                </Pressable>
                                
                            {messageHistory.map((conversation) => (
                                <Pressable
                                    key={conversation.id}
                                    className={`mb-2 rounded-xl p-4 ${conversation.id === currentConversationId ? "bg-accent/20" : "bg-background"}`}
                                    onPress={() => {
                                        setCurrentConversationId(conversation.id);
                                        setMenuOpen(false);
                                    }}
                                >
                                    <Text
                                        numberOfLines={2}
                                        className="font-sans-semibold text-primary"
                                    >
                                        {conversation.title || "Untitled conversation"}
                                    </Text>
                                </Pressable>
                            ))}

                            {messageHistory.length === 0 && (
                                <Text className="font-sans-medium text-muted-foreground">
                                    No conversations yet.
                                </Text>
                            )}
                        </ScrollView>
                    </View>

                    <Pressable
                        className="flex-1 bg-black/30"
                        onPress={() => setMenuOpen(false)}
                    />
                </View>
            )}



            <KeyboardAvoidingView
                className="flex-1"
                behavior="padding"
                keyboardVerticalOffset={0}
            >
                <View className="chats flex-1">
                    <ScrollView
                        ref={scrollViewRef}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        automaticallyAdjustKeyboardInsets
                        contentContainerClassName="conversation-area-container"
                        className="conversation-area flex-1">

                        {(messages || sending) && (
                            <View className="messages">
                                {messages?.messages.map((msg, index) => (
                                    <View
                                        key={index}
                                        className={`chat-message ${msg.role === "user" ? "user" : "coach"} `}
                                    >

                                        {msg.role === "assistant" && (

                                            <MarkdownDisplay
                                                style={markdownStyles}
                                            >
                                                {msg.content}
                                            </MarkdownDisplay>


                                        )}
                                        {msg.role === "user" && (
                                            <Text className="message-text">
                                                {msg.content}
                                            </Text>
                                        )}


                                    </View>
                                ))}
                                {sending && (
                                    <View className="chat-message coach sending">
                                        <Image source={icons.sendingAccent} className="size-6" />
                                    </View>
                                )}

                            </View>
                        )}



                        {(!messages && !sending) && (
                            <View className="no-messages">
                                <Image source={icons.assistantAccent} className="size-20" />
                                <Text className="text-lg font-sans-bold text-center">
                                    Your Coach is ready to assist you
                                </Text>
                            </View>
                        )}

                    </ScrollView>

                    <View className="input-area">
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            className="input-field"
                            placeholder="Type your message..."
                        />
                        <Pressable
                            className="send-button"
                            onPress={handleSend}>
                            <View className="send-button-text">
                                <Image source={icons.sendAccent} className="size-6" />
                            </View>
                        </Pressable>
                    </View>

                </View>
            </KeyboardAvoidingView>


        </SafeAreaView>
    )
}

export default Coach;