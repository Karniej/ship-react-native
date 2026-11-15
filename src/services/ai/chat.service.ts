import { apiCall } from "@/constants/api";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  model?: "gpt-4o" | "gpt-4o-mini" | "gpt-4-turbo" | "gpt-3.5-turbo";
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ChatResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface StreamChatOptions extends ChatOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullMessage: string) => void;
  onError?: (error: string) => void;
}

export const CHAT_MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast & affordable" },
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "High performance" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Legacy model" },
] as const;

export type ChatModel = (typeof CHAT_MODELS)[number]["id"];

export const chatService = {
  async sendMessage(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    try {
      const response = await apiCall("chat", {
        method: "POST",
        body: JSON.stringify({
          messages,
          model: options.model || "gpt-4o-mini",
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens || 2048,
          system_prompt: options.systemPrompt,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Chat request failed");
      }

      return {
        success: true,
        message: data.message || data.content,
      };
    } catch (error) {
      console.error("Chat service error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send message",
      };
    }
  },

  // Simple chat without history (single message)
  async chat(prompt: string, options: ChatOptions = {}): Promise<ChatResult> {
    const messages: ChatMessage[] = [];

    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    return this.sendMessage(messages, options);
  },

  // Validate message before sending
  validateMessage(message: string): { valid: boolean; error?: string } {
    if (!message || message.trim().length === 0) {
      return { valid: false, error: "Message cannot be empty" };
    }

    if (message.length > 32000) {
      return {
        valid: false,
        error: "Message is too long (max 32,000 characters)",
      };
    }

    return { valid: true };
  },

  // Format conversation history for display
  formatConversation(messages: ChatMessage[]): string {
    return messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "You" : "Assistant"}: ${m.content}`)
      .join("\n\n");
  },
};
