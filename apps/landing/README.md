# Vizumi Landing Page

This is the marketing landing page for Vizumi, built with Next.js 16 and Tailwind CSS v4.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment

This project is designed to be deployed as a separate project on Vercel.

1. Create a new Project in Vercel.
2. Import the `viz-notes-d2` repository.
3. In "Project Settings", set the **Root Directory** to `landing`.
4. Deploy.

## Project Structure

- `src/app`: App router pages and layouts.
- `src/components/landing`: Landing page sections (Hero, Features, etc.).
- `src/components/ui`: Reusable UI components.
- `src/lib`: Utilities and helpers.

## Design System

- **Colors**:
  - Paper: `#f6f1ea`
  - Ink: `#161b22`
  - Accent: `#1c8e9a`
  - Highlight: `#f59e0b`
  - Mist: `#f2f5f7`

- **Fonts**:
  - Display: Instrument Serif
  - Body: Space Grotesk
