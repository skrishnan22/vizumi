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

### Bento Aesthetic

The landing page uses a playful **bento-box** design language with card-based sections, subtle rounded corners, and soft shadows.

### Colors

- **Primary**: Warm coral scale (`#c65d3b`)
- **Secondary**: Sage scale (`#5a7d5e`)
- **Paper**: `#faf8f5`
- **Ink**: `#2c2c2c`
- **Bento Card Accents**: Coral, teal, amber, sky, violet, mint, rose, lime

### Fonts (Self-Hosted via `next/font`)

- **Display**: Space Grotesk — playful, geometric, modern
- **Body**: Inter — clean, highly readable
- **Mono**: JetBrains Mono — technical, crisp

### Bento Utilities

Custom CSS classes in `globals.css`:

- `.bento-card` — standard elevated card with subtle shadow and rounded corners
- `.bento-card-lg` — larger radius (2rem)
- `.bento-card-sm` — smaller radius (1rem)
- `.bento-card-elevated` — stronger shadow
- `.bento-bg-{color}` — tinted card backgrounds (coral, teal, amber, sky, violet, sand, mint, rose, lime, slate, warm)
- `.bento-text-{color}` — vibrant text accents

### Performance

- Fonts are self-hosted via `next/font/google` (no external CDN requests)
- Noise texture is CSS-based (no external SVG request)
- Hero background animations simplified to CSS-only grid + subtle gradient
- Reduced motion respected throughout
