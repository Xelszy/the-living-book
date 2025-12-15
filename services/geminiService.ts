
import { GoogleGenAI, Type, Modality, Schema, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Story, StoryParams } from "../types";
import { base64ToArrayBuffer } from "./audioUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Safety Settings (The Safety Agent) ---
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const MODEL_NAME = "gemini-2.5-flash";

// --- Agent 1: Story Planning Agent ---
// Responsibility: Define structure, moral, and visual consistency (Style Lock)
async function generateStoryPlan(params: StoryParams) {
  const systemInstruction = `
    You are the 'Story Planning Agent' for a children's book app.
    Target Audience: Kids 5-9 years old.
    Language: ${params.language === 'id' ? 'Indonesian' : 'English'}.
    
    Task:
    1. Create a title.
    2. Define a clear moral message.
    3. Create a 'Visual Style Guide' for the main character to ensure they look the same in every picture (e.g., 'A cute blue robot with round eyes and a yellow antenna').
    4. Outline a 4-part plot (Beginning, Conflict, Climax, Resolution).
    
    Theme: ${params.theme}
    Subject: ${params.subject}
    Character Type: ${params.character}
    Setting: ${params.setting}
    Custom Idea: ${params.customPrompt || 'None'}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: "Create the story plan.",
    config: {
      systemInstruction,
      safetySettings,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          moral: { type: Type.STRING },
          characterVisualDescription: { type: Type.STRING, description: "Detailed visual description of the hero for image generation consistency." },
          plotOutline: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 sentences outlining the 4 pages." }
        },
        required: ["title", "moral", "characterVisualDescription", "plotOutline"]
      }
    }
  });

  if (!response.text) throw new Error("Planning Agent failed.");
  return JSON.parse(response.text);
}

// --- Agent 2: Story Writer & Prompt Engineer Agent ---
// Responsibility: Write engaging text and technical image prompts using the Visual Guide.
async function generatePages(plan: any, params: StoryParams) {
  const langInstruction = params.language === 'id' ? "Write story text in Indonesian." : "Write story text in English.";
  
  const systemInstruction = `
    You are the 'Writer & Illustrator Agent'.
    
    Input Plan:
    - Title: ${plan.title}
    - Character Visuals: "${plan.characterVisualDescription}" (MUST be used in every image prompt)
    - Plot: ${JSON.stringify(plan.plotOutline)}
    
    Instructions:
    1. ${langInstruction}
    2. Write exactly 4 pages based on the plot outline.
    3. For 'imagePrompt', write a detailed stable-diffusion style prompt.
       CRITICAL: You MUST include "${plan.characterVisualDescription}" in EVERY image prompt to ensure the character looks the same.
       Style: "3D Pixar style, cute, vibrant, 4k render".
    
    Output JSON.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: "Write the book pages.",
    config: {
      systemInstruction,
      safetySettings,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pageNumber: { type: Type.INTEGER },
                text: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ["pageNumber", "text", "imagePrompt"]
            }
          }
        },
        required: ["pages"]
      }
    }
  });

  if (!response.text) throw new Error("Writer Agent failed.");
  return JSON.parse(response.text);
}

// --- Agent 3: Game Designer Agent ---
// Responsibility: Create an educational mini-game based on the story content.
async function generateGame(storyContext: string, params: StoryParams) {
  const systemInstruction = `
    You are the 'Game Interaction Agent'.
    Context: A children's story has just been read.
    Subject: ${params.subject}
    Language: ${params.language === 'id' ? 'Indonesian' : 'English'}
    
    Task: Create 1 multiple-choice question to test ${params.subject === 'story' ? 'Reading Comprehension (Why did X happen?)' : params.subject + ' skills related to the story'}.
    
    Example for Math: "If the hero found 2 apples and 3 oranges, how many fruits total?"
    Example for Story: "Why was the robot sad in the beginning?"
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Story Context: ${storyContext.substring(0, 1000)}... Create the game.`,
    config: {
      systemInstruction,
      safetySettings,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["quiz", "math_challenge"] },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswerIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["type", "question", "options", "correctAnswerIndex", "explanation"]
      }
    }
  });

  if (!response.text) throw new Error("Game Agent failed.");
  return JSON.parse(response.text);
}

// --- Main Orchestrator ---
export const generateStoryContent = async (params: StoryParams): Promise<Omit<Story, 'id' | 'createdAt'>> => {
  try {
    // 1. Planning Phase
    console.log("Agent 1: Planning...");
    const plan = await generateStoryPlan(params);

    // 2. Writing Phase
    console.log("Agent 2: Writing...");
    const pagesData = await generatePages(plan, params);

    // 3. Game Phase
    console.log("Agent 3: Designing Game...");
    const fullText = pagesData.pages.map((p: any) => p.text).join(" ");
    const gameData = await generateGame(fullText, params);

    return {
      title: plan.title,
      theme: params.theme,
      subject: params.subject,
      language: params.language,
      pages: pagesData.pages.map((p: any) => ({ ...p, isLoadingImage: true })),
      game: gameData,
    };

  } catch (error) {
    console.error("Orchestrator Error:", error);
    throw error;
  }
};

// --- Helper Services ---

export const generatePageImage = async (imagePrompt: string): Promise<string> => {
  const model = "gemini-2.5-flash-image"; // Using flash-image for speed/cost balance, or switch to imagen if available
  // Note: The user prompt asked for diffusion models. 'imagen-3.0-generate-001' or similar is ideal if key permits.
  // We'll stick to a standard prompt structure enhancement here.
  
  try {
    // Using generateImages (Imagen 3)
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });
    const base64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64) throw new Error("No image data");
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error generating image:", error);
    return `https://picsum.photos/800/800?random=${Math.floor(Math.random() * 1000)}`;
  }
};

export const generateSpeech = async (text: string, language: 'id' | 'en'): Promise<ArrayBuffer | undefined> => {
  const model = "gemini-2.5-flash-preview-tts";
  const voiceName = 'Kore'; // Good all-rounder

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64ToArrayBuffer(base64Audio);
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
  return undefined;
};
