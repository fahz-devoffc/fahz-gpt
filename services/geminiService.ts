
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIConfig, Attachment } from "../types";

export class GeminiService {
  private getClient() {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      throw new Error("API_KEY_NOT_FOUND: Masukkan API Key Anda di Environment Variables Vercel.");
    }
    
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
        model: config.model || 'gemini-flash-lite-latest',
        contents: { parts },
        config: {
          systemInstruction: config.systemInstruction,
          temperature: config.temperature,
        },
      });

      if (!response.text) {
        throw new Error("Model merespons kosong. Coba gunakan prompt yang lebih jelas.");
      }

      return response.text;
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      const msg = error.message || "";
      if (msg.includes("API key not valid")) {
        throw new Error("API Key yang Anda masukkan salah atau sudah kadaluwarsa. Silakan buat Key baru di Google AI Studio.");
      }
      if (msg.includes("model is not found") || msg.includes("404")) {
        throw new Error(`Model '${config.model}' tidak tersedia untuk akun Anda. Gunakan 'Fahz Lite' di pengaturan.`);
      }
      if (msg.includes("quota") || msg.includes("429")) {
        throw new Error("Batas penggunaan gratis tercapai. Tunggu beberapa saat atau beralih ke model Lite.");
      }
      
      throw new Error(msg || "Terjadi masalah koneksi ke server Google AI.");
    }
  }

  async generateImage(prompt: string): Promise<string> {
    const ai = this.getClient();
    try {
      // Model ini biasanya masuk dalam kategori free tier dengan limit harian
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
      });

      const candidates = response.candidates;
      if (candidates && candidates[0].content.parts[0].inlineData) {
        const part = candidates[0].content.parts[0];
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      throw new Error("Gagal memproses gambar.");
    } catch (error: any) {
      throw new Error("Fitur gambar mungkin dibatasi untuk akun gratis atau prompt melanggar kebijakan.");
    }
  }

  async generateVideo(prompt: string): Promise<string> {
    const ai = this.getClient();
    try {
      // Fitur video (Veo) sangat jarang tersedia di akun gratis tanpa billing aktif
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      throw new Error("Generate Video biasanya memerlukan akun berbayar (Pay-as-you-go).");
    }
  }
}

export const geminiService = new GeminiService();
