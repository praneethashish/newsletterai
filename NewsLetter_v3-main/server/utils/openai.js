import OpenAI from "openai";

const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
});

export const generateContent = async (prompt) => {
  try {
    console.log("Attempting to generate content with Azure OpenAI...");
    const response = await openai.chat.completions.create({
      model: deployment,
      messages: [{ role: "user", content: prompt }],
    });
    console.log("Content generated successfully.");
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error during Azure OpenAI call:", error);
    throw new Error("Failed to generate content with Azure OpenAI.");
  }
};