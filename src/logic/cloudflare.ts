const ACCOUNT_ID = process.env.EXPO_PUBLIC_CF_ACCOUNT_ID || "";
const API_TOKEN = process.env.EXPO_PUBLIC_CF_API_TOKEN || "";

const MODEL_ID = "@cf/bytedance/stable-diffusion-xl-lightning";

export const generateAcademyImage = async (prompt: string): Promise<string | null> => {
  if (!ACCOUNT_ID || !API_TOKEN || ACCOUNT_ID === "YOUR_CLOUDFLARE_ACCOUNT_ID") {
    // Fallback to Pollinations if not configured
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + " 3d claymation style minimalist children book")}`;
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL_ID}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          prompt: `cute 3D cartoon style for children, ${prompt}, vibrant colors, friendly atmosphere, high quality 3D render, minimalist, soft studio lighting, Pixar style, no text, clean simple background`,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudflare API error:", errorData);
      throw new Error("Cloudflare API error");
    }

    // Cloudflare returns the image as binary (blob)
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error with Cloudflare:", error);
    // Silent fallback so the app stays functional
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + " 3d claymation style minimalist children book")}`;
  }
};
