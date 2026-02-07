
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIConfig, Attachment } from "../types";

export class GeminiService {
  private getClient() {
    // Memastikan akses ke process.env.API_KEY
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      throw new Error("API_KEY_MISSING: Variabel lingkungan API_KEY tidak terdeteksi di server/browser.");
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
        throw new Error("Model merespons tapi tidak memberikan teks. Coba ganti model atau instruksi.");
      }

      return response.text;
    } catch (error: any) {
      console.error("Gemini API Error Detail:", error);
      // Menangkap error spesifik dari API Google
      if (error.message?.includes("API key not valid")) {
        throw new Error("API Key tidak valid. Periksa kembali di dashboard Google AI Studio.");
      }
      if (error.message?.includes("model is not found") || error.message?.includes("404")) {
        throw new Error(`Model '${config.model}' tidak ditemukan atau API Key Anda belum mendukung model ini.`);
      }
      throw new Error(error.message || "Terjadi gangguan koneksi ke server AI.");
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
      if (!candidates || candidates.length === 0) throw new Error("Gagal generate gambar. Coba prompt lain.");
      
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Data gambar tidak ditemukan dalam respons API.");
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
      if (!downloadLink) throw new Error("Link video tidak ditemukan setelah proses selesai.");
      
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error("Gagal mengunduh file video hasil generate.");
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      console.error("Video Gen Error:", error);
      if (error.message?.includes("entity was not found") || error.message?.includes("403")) {
        throw new Error("Akses Veo ditolak. Pastikan API Key berasal dari project GCP dengan billing aktif.");
      }
      throw new Error(error.message || "Gagal membuat video.");
    }
  }
}

export const geminiService = new GeminiService();
