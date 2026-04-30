# Environment Setup Guide

To get this project running, you need to set up your environment variables. This project uses Expo, so all environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the code.

## 1. Create your `.env` file

Copy the template from `.env.example` to a new file named `.env`:

```bash
cp .env.example .env
```

## 2. Obtain API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create a new API Key.
3. Paste it into `EXPO_PUBLIC_GEMINI_API_KEY` in your `.env` file.

### Hugging Face API
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens).
2. Create a new "Read" or "Write" token (Access Token).
3. Paste it into `EXPO_PUBLIC_HF_TOKEN` in your `.env` file.

### Cloudflare Workers AI
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. **Account ID**: You can find this in the URL of your dashboard or under the "Workers & Pages" section.
3. **API Token**:
    - Go to "My Profile" > "API Tokens".
    - Create a token using the "Workers AI" template.
4. Paste these into `EXPO_PUBLIC_CF_ACCOUNT_ID` and `EXPO_PUBLIC_CF_API_TOKEN` respectively.

## 3. Restart the Project

After updating your `.env` file, you need to restart your Expo server for the changes to take effect:

```bash
npx expo start -c
```
The `-c` flag clears the cache, ensuring the new environment variables are loaded.
