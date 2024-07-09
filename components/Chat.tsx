"use client";

import { useState, useEffect } from "react";
import { useEnterSubmit } from "@/lib/hooks/useEnterSubmit";
import { sb } from "substrate";
import { SendIcon } from "@/components/icons/SendIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { SubstrateIcon } from "@/components/icons/SubstrateIcon";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type SubstrateStream = Awaited<ReturnType<typeof sb.streaming.fromSSEResponse>>;

type MessageItem =
  | { from: "USER"; content: string }
  | {
      from: "ASSISTANT";
      stream: SubstrateStream;
    };

function UserMessage({ content }: { content: string }) {
  return (
    <div className="rounded flex flex-row space-x-2 p-2">
      <div className="p-2 w-[48px]">
        <UserIcon />
      </div>
      <div className="rounded bg-white border drop-shadow-sm grow p-2">
        {content}
      </div>
    </div>
  );
}

function AIMessage({ stream }: { stream: SubstrateStream }) {
  const [content, setContent] = useState<string>("");
  useEffect(() => {
    (async () => {
      for await (let message of stream) {
        setContent((content) => content + message.content);
      }
    })();
  }, []);

  return (
    <div className="rounded flex flex-row space-x-2 p-2">
      <div className="p-2 w-[48px]">
        <SubstrateIcon />
      </div>
      <div className="rounded bg-white border drop-shadow-sm grow p-2">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </div>
    </div>
  );
}

export function Chat(props: { chatId: string }) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [userPrompt, setUserPrompt] = useState<string>("");

  async function submitPrompt(event: any) {
    event.preventDefault();

    setMessages((messages) => [
      ...messages,
      { from: "USER", content: userPrompt } as MessageItem,
    ]);

    setUserPrompt("");

    const request = new Request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ chatId: props.chatId, userPrompt }),
    });
    const response = await fetch(request);

    if (response.ok) {
      const stream = await sb.streaming.fromSSEResponse(response);
      setMessages((messages) => [
        ...messages,
        { from: "ASSISTANT", stream } as MessageItem,
      ]);
    }
  }

  return (
    <div className="">
      <div className="mx-auto sm:max-w-3xl sm:px-4 space-y-2 pt-12 pb-32">
        {messages.map((message, i) =>
          message.from === "USER" ? (
            <UserMessage key={i} content={message.content} />
          ) : (
            <AIMessage key={i} stream={message.stream} />
          ),
        )}
      </div>

      <div className="fixed bottom-0 w-full">
        <div className="mx-auto sm:max-w-2xl sm:px-4">
          <div className="space-y-4 border-t backdrop-blur-lg drop-shadow-2xl bg-white/30 px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
            <form ref={formRef} className="" onSubmit={submitPrompt}>
              <div className="shadow-xl flex flex-row space-x-2 rounded bg-white">
                <input
                  name="prompt"
                  autoFocus={true}
                  placeholder="Enter your prompt..."
                  value={userPrompt}
                  onChange={(event) => setUserPrompt(event.target.value)}
                  type="text"
                  className="min-h-[50px] w-full px-4 py-0 focus-within:outline-none rounded"
                  onKeyDown={onKeyDown}
                />
                <button
                  type="submit"
                  className="rounded pr-4 hover:text-blue-400"
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
