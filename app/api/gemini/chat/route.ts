import { NextRequest, NextResponse } from "next/server";
import { getModel, jsonError, text } from "../_lib";
import { createOfflineChatResponse } from "../offline";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, eventContext } = await req.json() as {
      messages: ChatMessage[];
      eventContext: Record<string, string>;
    };
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return jsonError("A valid message history is required.");
    }
    const safeMessages = messages
      .filter((message) => message?.role === "user" || message?.role === "assistant")
      .map((message) => ({ ...message, content: text(message.content) }))
      .filter((message) => message.content.length > 0);
    if (safeMessages.length === 0) return jsonError("A message is required.");

    const safeContext = Object.fromEntries(
      Object.entries(eventContext || {}).map(([key, value]) => [key, text(value)])
    );
    const lastMessage = safeMessages[safeMessages.length - 1];
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json({
        response: createOfflineChatResponse(lastMessage.content, text(safeContext.eventType, "event")),
      });
    }
    const systemInstruction = `You are an expert, friendly event planning assistant specializing in ${text(safeContext.eventType, "events")}.
Event context: ${JSON.stringify(safeContext)}.
Be concise, practical, and enthusiastic. Use bullet points for lists. Keep responses under 300 words.`;
    const model = getModel(systemInstruction);

    // Build history from all messages except the last (which we'll send as the new message)
    const history = safeMessages.slice(0, -1).map((m: ChatMessage) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    const result = await chat.sendMessage(lastMessage.content);

    return NextResponse.json({ response: result.response.text() });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
