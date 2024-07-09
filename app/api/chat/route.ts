"use server";

import { ChatHistory } from "@/lib/ChatHistory";
import { bot } from "@/lib/bot";

const chatHistory = new ChatHistory();

export async function POST(request: Request) {
  const { userPrompt, chatId } = await request.json();

  const result = bot(userPrompt, chatHistory, chatId);
  return new Response(iteratorToSSEStream(result), {
    headers: { "Content-Type": "text/event-stream" },
  });
}

function iteratorToSSEStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        const data = { content: value };
        const sseMessage = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(sseMessage);
      }
    },
  });
}
