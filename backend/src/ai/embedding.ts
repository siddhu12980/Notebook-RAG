import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone/dist/index";

import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

const pineconeApiKey = process.env.PINECONE_API_KEY;

if (!pineconeApiKey) {
  throw new Error("PINECONE_API_KEY is not set");
}

const pinecone = new PineconeClient({
  apiKey: pineconeApiKey,
});

const indexName = process.env.PINECONE_INDEX_NAME || "";

if (!indexName) {
  throw new Error("PINECONE_INDEX_NAME is not set");
}

const pineconeIndex = pinecone.Index(indexName);

export const vectorStore = new PineconeStore(embeddings, {
  pineconeIndex,
  namespace: 'default',
});

export async function searchDocuments(query: string, filter: Record<string, any>, k: number = 10) {
  return await vectorStore.similaritySearch(query, k, filter);
}

export async function embedPdf(
  pdfBuffer: Buffer,
  filename: string,
  userId: string,
  conversationId: string
) {

  const tempFilePath = path.join(os.tmpdir(), filename);
  fs.writeFileSync(tempFilePath, pdfBuffer);

  try {
    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`Split into ${splitDocs.length} chunks`);

    const docsWithMetadata = splitDocs.map((doc, index) => ({
      ...doc,   
      metadata: {
        ...doc.metadata,
        filename: filename,
        uploadDate: new Date().toISOString(),
        chunkIndex: index,
        userId: userId,
        conversationId: conversationId,
      },
    }));

    const vectorStore = await PineconeStore.fromDocuments(
      docsWithMetadata,
      embeddings,
      {
        pineconeIndex,
        namespace: 'default',
      }
    );

    console.log("Vector store created", vectorStore);

    return {
      success: true,
      message: "PDF uploaded and indexed successfully",
      filename: filename,
      chunksCreated: splitDocs.length,
      indexName: process.env.PINECONE_INDEX_NAME,
    };
  } catch (e) {
    console.error("Error embedding PDF:", e);
    return {
      success: false,
      message: "Error embedding PDF",
    };
  } finally {
    fs.unlinkSync(tempFilePath);
  }
}
