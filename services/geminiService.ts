
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIConfig, Attachment } from "../types";

export class GeminiService {
  private getClient() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key tidak ditemukan. Pastikan sudah diset di Environment Variables.");
    return new GoogleGenAI({ apiKey });
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
          topK: 64,
          topP: 0.95,
        },
      });

      if (!response.text) {
        throw new Error("Model mengembalikan respons kosong.");
      }

      return response.text;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(error.message || "Terjadi kesalahan pada server Gemini.");
    }
  }

  async generateImage(prompt: string): Promise<string> {
    const ai = this.getClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { 
          imageConfig: { 
            aspectRatio: "1:1" 
          } 
        }
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) throw new Error("Tidak ada gambar yang dihasilkan.");
      
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Gagal mengekstrak data gambar dari respons.");
    } catch (error: any) {
      console.error("Image Gen Error:", error);
      throw new Error(error.message || "Gagal membuat gambar.");
    }
  }

  async generateVideo(prompt: string): Promise<string> {
    const ai = this.getClient();
    try {
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
      if (!downloadLink) throw new Error("Gagal mendapatkan link download video.");
      
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error("Gagal mengunduh file video dari server.");
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      console.error("Video Gen Error:", error);
      if (error.message?.includes("entity was not found")) {
        throw new Error("Project billing atau API Key tidak memiliki akses ke model Veo.");
      }
      throw new Error(error.message || "Gagal membuat video.");
    }
  }
}

export const geminiService = new GeminiService();
