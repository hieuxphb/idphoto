
import { GoogleGenAI } from "@google/genai";
import { PhotoSettings, BackgroundColor, ClothingType, HairstyleType, PhotoSize } from "../types";

export const processIDPhoto = async (
  base64Image: string,
  settings: PhotoSettings,
  customApiKey?: string
): Promise<string> => {
  // Ưu tiên sử dụng customApiKey nếu có, nếu không thì dùng process.env.API_KEY
  const apiKey = customApiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing. Please configure it in settings.");
  
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const imageData = base64Image.split(',')[1] || base64Image;

  const prompt = `
    TASK: Transform this portrait into a high-quality, professional STANDARD ID PHOTO.
    
    USER TARGET: ${settings.target} (${settings.gender})
    
    COMPOSITION & CROPPING:
    - CENTER the face perfectly. Ensure head and shoulders are fully visible.
    - HEAD SIZE: Should occupy 70-80% of the image height.
    - BACKGROUND: Replace the current background with a SOLID, FLAT ${settings.background} color. No shadows, no gradients.
    - CLOTHING: ${settings.clothing === 'Giữ nguyên' ? 'Keep original clothing but clean it up to look professional' : `Replace the current clothing with a professional ${settings.clothing}`}.
    - HAIR: ${settings.hair === 'Giữ nguyên' ? 'Keep original hair but make it look very neat and tidy' : `Style the hair as ${settings.hair} and make it look perfectly groomed`}.
    
    BEAUTY & ENHANCEMENT:
    - Apply professional skin retouching (Level ${settings.beautyLevel}/100).
    - Brighten the skin naturally (Level ${settings.skinBrightening}/100).
    - Remove blemishes, flyaway hairs, and even out skin tone while maintaining natural identity.
    
    ADDITIONAL USER REQUEST: ${settings.customDescription || 'None'}

    OUTPUT: One clean, sharp, professional ID photo. Ensure lighting is studio-quality and even.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Sử dụng Flash model cho API key miễn phí
      contents: {
        parts: [
          {
            inlineData: { data: imageData, mimeType: 'image/jpeg' },
          },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: { 
          aspectRatio: "3:4"
          // imageSize: "1K" // gemini-2.5-flash-image không hỗ trợ imageSize, nó tự động chọn kích thước tối ưu.
        }
      }
    });

    let resultImage = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          resultImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!resultImage) throw new Error("AI failed to generate image. Please check your API key and network.");
    return resultImage;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
