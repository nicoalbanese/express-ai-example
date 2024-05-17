import { generateText, streamText, streamObject, streamToResponse } from "ai";
import { openai } from "@ai-sdk/openai";
import "dotenv/config";
import cors from "cors";
import z from "zod";

import express from "express";

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  const { text } = await generateText({
    model: openai("gpt-3.5-turbo"),
    prompt: "Invent a new holiday and describe its traditions.",
  });

  res.json({ text });
});

app.get("/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const result = await streamText({
    model: openai.chat("gpt-3.5-turbo"),
    maxTokens: 512,
    temperature: 0.3,
    maxRetries: 5,
    prompt: "Invent a new holiday and describe its traditions.",
  });
  streamToResponse(result.toAIStream(), res);
});

app.post("/api/completion", async (req, res) => {
  const { prompt } = req.body;

  const response = await streamText({
    model: openai.chat("gpt-3.5-turbo"),
    prompt,
  });

  streamToResponse(response.toAIStream(), res);
});

app.get("/api/stream-object", async (req, res) => {
  const response = await streamObject({
    model: openai.chat("gpt-3.5-turbo"),
    prompt: "Tell me a joke",
    schema: z.object({
      joke: z.object({ setup: z.string(), punchline: z.string() }),
    }),
  });

  streamToResponse(response, res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
