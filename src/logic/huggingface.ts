// Use environment variable for the token
const HF_TOKEN = process.env.EXPO_PUBLIC_HF_TOKEN || ""; 

const MODEL_ID = "stabilityai/sdxl-turbo";

export const generateAcademyImage = async (prompt: string): Promise<string | null> => {
  if (!HF_TOKEN) {
    console.warn("Hugging Face token is missing. Falling back to Pollinations.");
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + " 3d claymation style minimalist children book")}`;
  }

  const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

  try {
    const response = await fetch(API_URL, {
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        "X-Wait-For-Model": "true",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: `${prompt}, 3d claymation style, minimalist, soft lighting, pastel colors, high quality children's book illustration, no text`,
      }),
    });

    // If the model is not found or not supported for POST on this endpoint
    if (response.status === 404 || response.status === 405) {
      console.warn(`Model ${MODEL_ID} not available on free API (Status ${response.status}). Falling back to Pollinations.`);
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + " 3d claymation style minimalist children book")}`;
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Hugging Face API error (${response.status}):`, errorData);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error with Hugging Face:", error);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + " 3d claymation style minimalist children book")}`;
  }
};
