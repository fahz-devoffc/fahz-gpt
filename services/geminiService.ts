
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIConfig, Attachment } from "../types";

export class GeminiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async generateResponse(prompt: string, config: AIConfig, attachments?: Attachment[]): Promise<string> {
    const ai = this.getClient();
    try {
      const parts: any[] = [{ text: prompt }];
      
      if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
          parts.push({
            inlineData: {
              data: att.data,
              mimeType: att.mimeType
            }
          });
        });
      }

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: config.model,
        contents: { parts },
        config: {
          systemInstruction: config.systemInstruction,
          temperature: config.temperature,
        },
      });

      return response.text || "Maaf, saya tidak bisa memberikan respons.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  }

  async generateVideo(prompt: string): Promise<string> {
    const ai = this.getClient();
    
    // Veo requires user-selected key typically, but we'll try with current injected key
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}

export const geminiService = new GeminiService();
