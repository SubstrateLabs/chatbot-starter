import { Substrate, Llama3Instruct70B, ComputeJSON, sb } from "substrate";

import { ChatHistory } from "@/lib/ChatHistory";

const SUBSTRATE_API_KEY = process.env["SUBSTRATE_API_KEY"];

const substrate = new Substrate({ apiKey: SUBSTRATE_API_KEY });

export async function* bot(
  userPrompt: string,
  chatHistory: ChatHistory,
  chatId: string,
) {
  const foods = new ComputeJSON(
    {
      prompt: `Analyze the following message and return all the food items mentioned if there are any.

=== Message
${userPrompt}
`,
      json_schema: {
        type: "object",
        properties: {
          foods: {
            type: "array",
            items: {
              type: "string",
            },
            maxItems: 10,
            description: "Food items mentioned",
          },
        },
      },
    }
  );

  chatHistory.add(chatId, "USER", userPrompt);

  const result = new Llama3Instruct70B(
    {
      prompt: sb.interpolate`You are a helpful assistant that helps answer general questions about food and cooking.

=== Helpful Guidance
* Ask clarifying questions when the user is unclear
* Make sure to refer to the message history to inform your answers
* Ensure your replies are friendly and concise
* Highlight ingredients the user may be interested in shopping for
* If there is any special equipment or techniques make sure to include them
* Make sure to use any food items the user has specifically mentioned

=== Message History
${chatHistory.recent(chatId)}

=== Food Items
${sb.jq(foods.future.json_object, '.foods | map("* " + .) | join("\n")')}

=== User Message
${userPrompt}`,
    },
    { id: "result" },
  );

  const stream = await substrate.stream(foods, result);

  for await (let message of stream) {
    if (message.node_id === "result") {
      if (message.object === "node.delta") {
        yield message.data.choices.item.text;
      }
      if (message.object === "node.result") {
        chatHistory.add(
          chatId,
          "ASSISTANT",
          message.data.choices.at(0)!.text as string,
        );
      }
    }
  }
}
