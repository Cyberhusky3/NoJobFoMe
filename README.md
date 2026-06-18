# FightFit AI

FightFit AI is a production-ready MVP for beginners who want to get fit and learn how to fight but do not know where to start. It combines a Duolingo-style assessment, martial arts style matching, gamified progress, visual skill trees, training plans, and mocked revenue surfaces for premium AI coaching, local gyms, and gear recommendations.

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Framer Motion
- LocalStorage MVP persistence
- Mock seed data
- Mobile-first dark UI

## Features

- Landing page with the headline **Find Your Fighting Style.**
- 13-question beginner assessment persisted to `localStorage`.
- Style matching engine for Boxing, Muay Thai, Kickboxing, BJJ, Wrestling, Judo, Karate, Taekwondo, and MMA.
- Match cards with percentage, reasons, learning curve, fitness benefits, self-defense score, and beginner friendliness.
- Gamified dashboard with XP, streak, level, weekly goals, badges, and unlock states.
- Visual skill trees for Boxing, BJJ, Muay Thai, and MMA.
- Personalized weekly training plan with warmup, skill work, strength, conditioning, and recovery.
- Revenue-ready mocked sections: AI Coach Premium, Local Gym Finder, Gear Store, Premium Membership.
- Profile summary derived from assessment answers.

## Run Locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Production Build

```bash
npm run build
npm start
```

## Project Structure

- `src/app/page.tsx` renders the MVP shell.
- `src/components/app.tsx` contains the client-side experience, assessment state, scoring UI, and premium modal.
- `src/lib/data.ts` contains realistic seed data for styles, questions, skill trees, workouts, achievements, gear, and progress.
- `src/app/globals.css` contains Tailwind globals and shared MVP utility classes.
