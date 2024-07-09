type Message  = {
  from: "ASSISTANT" | "USER";
  content: string;
};

export class ChatHistory {
  data: Record<string, Message[]>;

  constructor(data: Record<string, Message[]> = {}) {
    this.data = data;
  }

  add(chatId: string, from: Message["from"], content: Message["content"]) {
    if (!this.data[chatId]) this.data[chatId] = [];
    this.data[chatId].push({ from, content });
  }

  recent(chatId: string, n: number = 5) {
    return (this.data[chatId] || []).slice(-n).map((message, i: number) => {
      return `[${i}] ${message.from}: ${message.content}`;
    }).join("\n");
  }
}
