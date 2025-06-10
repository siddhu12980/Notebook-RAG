import { ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { concat } from "@langchain/core/utils/stream";
import { StateAnnotation } from "./state_ai";
import { InputStateAnnotation } from "./state_ai";
import { vectorStore } from "./embedding";
import { StateGraph } from "@langchain/langgraph";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

export const retrieve = async (state: typeof InputStateAnnotation.State) => {
  const retrievedDocs = await vectorStore.similaritySearch(state.question, 10, {
    userId: state.userId,
    conversationId: state.conversationId,
  });
  return { context: retrievedDocs };
};

export const generate = async (state: typeof StateAnnotation.State) => {
  const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const docsContent = state.context
    .map((doc: any) => doc.pageContent)
    .join("\n");

  const messages = await promptTemplate.invoke({
    question: state.question,
    context: docsContent,
  });

  const response = await llm.invoke(messages);
  return { answer: response.content };
};

export async function chatwithRagModel(
  question: string,
  userId: string,
  conversationId: string
) {
  const input = {
    question,
    userId,
    conversationId,
  };

  const { answer } = await graph.invoke(input);

  console.log("answer", answer);

  return answer;
}

const graph = new StateGraph(StateAnnotation)
  .addNode("retrieve", retrieve)
  .addNode("generate", generate)
  .addEdge("__start__", "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", "__end__")
  .compile();

export { graph };
