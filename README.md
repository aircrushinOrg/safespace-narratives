# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/813a23ac-9bfa-45c7-b92d-14ba1b5d4a16

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/813a23ac-9bfa-45c7-b92d-14ba1b5d4a16) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables for AI conversations.
cp .env.example .env
# Edit .env and add your DeepSeek API key:
# VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## AI-Powered Conversations

This application features AI-powered conversations for sexual health education scenarios. To enable these conversations:

1. **Get a DeepSeek API key**: Visit [DeepSeek Platform](https://platform.deepseek.com/) and create an account to get your API key.

2. **Set up environment variable**: Create a `.env` file in the project root and add:
   ```
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

3. **How it works**: 
   - Walk around the 2D campus game
   - Approach NPCs (Alex, Jamie, Taylor, Riley) 
   - Press SPACE/ENTER to interact
   - This triggers an AI conversation where you can type your own responses
  - The AI evaluates your conversation for sexual health education goals

## Art & Assets

- See `docs/ART_GUIDE.md` for visual direction and the asset pipeline (Tiled maps, sprite sheets, UI).
- Place art in `public/assets/**`:
  - `public/assets/tiles` – tilesets/TSX
  - `public/assets/maps` – Tiled JSON maps
  - `public/assets/characters` – sprite sheets/atlases
  - `public/assets/ui` – UI sprites (icons, 9-slice)
  - `public/assets/audio` – SFX/music
- The game currently uses generated placeholders; you can replace them incrementally without breaking the build.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/813a23ac-9bfa-45c7-b92d-14ba1b5d4a16) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## DeepSeek Chat Setup

This app supports real conversational testing using DeepSeek.

- Env file (recommended for local dev): create a `.env` at the project root and set

  ```
  VITE_DEEPSEEK_API_KEY=your_key_here
  ```

- In‑app fallback: if the env var is not present, the app shows an API key input and stores the key in `localStorage` only.

Security note: Frontend env vars are embedded in the bundle and visible to clients. For production, use a server proxy to keep secrets server‑side.
