import { Document } from "@langchain/core/documents";
import { Annotation } from "@langchain/langgraph";

export const InputStateAnnotation = Annotation.Root({
  question: Annotation<string>,
  userId: Annotation<string>,
  conversationId: Annotation<string>,
});

export const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  userId: Annotation<string>,
  conversationId: Annotation<string>,
  context: Annotation<Document[]>,
  answer: Annotation<string>,
});

