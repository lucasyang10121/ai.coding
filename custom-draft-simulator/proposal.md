# Proposal: Custom Draft Simulator

## Project Vision
The Custom Draft Simulator is a fun and interactive web app for friends who want to build fantasy draft teams in a flexible and realistic way. The goal is to create a simple but smart platform where users can join private draft rooms, make picks, manage a salary cap, and compare team builds in real time.

This project is being built as a learning experience, so the focus is on building a useful full-stack app with real features, clear user flows, and AI support that makes the experience feel more exciting.

## Core Features
1. Private Draft Lobbies
   - Users can create a draft room and invite friends using a shareable link.
   - Each lobby can have its own rules and settings.

2. Real-Time Draft Experience
   - Draft picks, bids, and updates appear instantly for all users.
   - The app should feel live and responsive during the draft.

3. Custom Draft Settings
   - Hosts can choose between a salary cap format or a non-salary-cap format.
   - Users can enable practice draft mode for training or testing strategies.
   - Users can also add bot opponents to simulate realistic competition.

4. Interactive Draft Board
   - A central dashboard shows the draft order, current bids, team needs, and recent picks.
   - Users can quickly understand the state of the draft.

5. Real NFL Player Database
   - The app will use real NFL players as the draft pool.
   - Each player can include position, team, projected value, and basic stats.
   - Users can search and compare real players before making decisions.

## User Stories
- As a user, I want to create a private draft room so I can play with friends.
- As a participant, I want to see live updates during the draft so I can follow the action easily.
- As a manager, I want to stay under the salary cap or choose a non-cap mode so I can customize the draft experience.
- As a player, I want to search real NFL players and compare options so I can build a strong team.
- As a draft host, I want to use practice draft settings and bot opponents so I can test strategies safely.
- As a draft host, I want to use AI helpers so the experience feels more dynamic and realistic.

## Tech Stack
- Next.js for the front end and server-side logic
- MongoDB for storing users, lobbies, players, and draft history
- Tailwind CSS for a clean and responsive user interface
- NextAuth.js for user login and authentication
- Socket.io or Pusher for real-time communication

## Brief Notes on AI Integration
The app will include simple AI features to make it more useful and interesting:

- AI Draft Bots: If a room is short on human players, AI bots can fill the empty spots.
- Smart Roster Grading: After the draft, AI can review each team and give a quick score or suggestion.
- AI Recommendations: During the draft, the app can suggest players and ideal bid ranges based on the user’s budget and team needs.

## Expected Outcome
By the end of this project, the app will provide a complete draft simulation experience with live interaction, budgeting rules, player tracking, and AI features that make the project feel modern and practical for learning full-stack development.
