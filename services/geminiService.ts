import { GoogleGenerativeAI } from "@google/generative-ai";
import { PhotoSettings, BackgroundColor } from "../types";

/**
 * QUAN TRỌNG: Gemini API KHÔNG THỂ chỉnh sửa hoặc tạo ảnh.
 * Nó chỉ có thể:
 * 1. Phân tích ảnh
 * 2. Đưa ra hướng dẫn chỉnh sửa
 * 3. Tạo text description
 * 
 * Để thực sự chỉnh sửa ảnh, bạn cần:
 * - Imagen API (Google, trả phí)
 * - DALL-E 3 (OpenAI, trả phí)
 * - Stable Diffusion API (trả phí)
 * - Hoặc xử lý ảnh bằng Canvas/WebGL
 */

// Helper: Convert background color to hex
const getBackgroundHex = (color: BackgroundColor): string => {
  const colorMap: Record<BackgroundColor, string> = {
    'Xanh': '#4A90E2',
    'Trắng': '#FFFFFF',
    'Xám': '#E5E5E5',
    'Xanh Đậm': '#1E3A8A'
  };
  return colorMap[color] || '#4A90E2';
};

// Helper: Basic image processing với Canvas
const processImageWithCanvas = async (
  base64Image: string,
  settings: PhotoSettings
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      // Set size for ID photo (3x4 ratio)
      const targetWidth = 600;
      const targetHeight = 800;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Fill background color
      ctx.fillStyle = getBackgroundHex(settings.background);
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calculate scaling to fit image
      const scale = Math.max(
        targetWidth / img.width,
        targetHeight / img.height
      );
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Center the image
      const x = (targetWidth - scaledWidth) / 2;
      const y = (targetHeight - scaledHeight) / 2;

      // Apply basic filters for beauty
      if (settings.beautyLevel > 0) {
        ctx.filter = `blur(${settings.beautyLevel / 50}px) brightness(${1 + settings.skinBrightening / 200})`;
      }

      // Draw image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Reset filter
      ctx.filter = 'none';

      // Add subtle vignette for professional look
      const gradient = ctx.createRadialGradient(
        targetWidth / 2, targetHeight / 2, 0,
        targetWidth / 2, targetHeight / 2, targetWidth * 0.7
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Convert to base64
      resolve(canvas.toDataURL('image/png', 0.95));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64Image;
  });
};

// Main function with AI analysis
export const processIDPhoto = async (
  base64Image: string,
  settings: PhotoSettings,
  customApiKey?: string
): Promise<string> => {
  const apiKey = customApiKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  try {
    // Method 1: Basic Canvas Processing (Fast, always works)
    console.log('Processing image with Canvas...');
    const processedImage = await processImageWithCanvas(base64Image, settings);

    // Method 2: Optional AI Enhancement Analysis
    // Uncomment if you want AI to analyze the photo quality
    /*
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const imageData = base64Image.split(',')[1] || base64Image;
    const prompt = `Analyze this portrait photo and provide suggestions to make it look more professional for an ID photo. 
    Consider: lighting, composition, background, clothing appropriateness.
    Keep response under 100 words.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg"
        }
      },
      prompt
    ]);

    const analysis = result.response.text();
    console.log('AI Analysis:', analysis);
    */

    return processedImage;

  } catch (error: any) {
    console.error("Processing Error:", error);
    
    // Fallback: Just return basic canvas processing
    if (error.message?.includes('API')) {
      console.log('AI failed, using basic processing...');
      return processImageWithCanvas(base64Image, settings);
    }
    
    throw error;
  }
};

/**
 * ALTERNATIVE: Nếu muốn dùng API chỉnh sửa ảnh thật sự, dùng các service này:
 * 
 * 1. Replicate API (Stable Diffusion)
 *    - https://replicate.com/
 *    - Model: stability-ai/sdxl
 *    - Có Image-to-Image
 * 
 * 2. Remove.bg API
 *    - https://www.remove.bg/api
 *    - Xóa background tự động
 * 
 * 3. Cloudinary AI
 *    - https://cloudinary.com/
 *    - Background removal, generative fill
 * 
 * 4. Face++ API
 *    - https://www.faceplusplus.com/
 *    - Face beautification, skin smoothing
 */
