# Design Document: Custom Draft Simulator

## 1. System Architecture

This project is a full-stack web app built with Next.js and MongoDB. The app is organized in a simple flow:

Frontend → Backend → Database → AI

1. Frontend
   - Built with Next.js and TypeScript.
   - Handles pages such as the home page, lobby page, draft board, and player search.
   - Uses Tailwind CSS for styling.
   - Communicates with the backend through API routes and real-time updates.

2. Backend
   - Next.js API routes handle lobby creation, draft actions, player lookup, and AI requests.
   - Server logic checks draft rules, budget limits, and turn order.
   - Real-time updates are sent using Socket.io or Pusher.

3. Database
   - MongoDB stores users, lobbies, players, draft events, and team rosters.
   - The database is flexible, which is helpful for changing draft rules and storing different lobby settings.

4. AI Layer
   - AI is used for three main features:
     - bot drafting when there are not enough human players
     - roster grading after the draft
     - player recommendations during the draft

A simple student-friendly flow looks like this:

User opens app → creates or joins lobby → draft actions are sent to backend → backend updates MongoDB → real-time updates are shared → AI gives suggestions or grades the team

---

## 2. Pages

The app will have the following Next.js pages:

- / → Home page
  - Intro to the app
  - Buttons to create a lobby or join a draft

- /login → Login page
  - User sign-in

- /register → Register page
  - New user account creation

- /dashboard → User dashboard
  - Shows joined lobbies, past drafts, and profile info

- /lobbies → Browse lobbies
  - Lists public or joinable draft rooms

- /lobbies/create → Create lobby page
  - Lets the host create a new draft room

- /lobbies/[id] → Lobby details page
  - Shows room info, participants, draft settings, and invite link

- /lobbies/[id]/draft → Draft room page
  - Main live draft screen
  - Shows player board, budget, timer, and current pick

- /players → Player database page
  - Search and browse real NFL players

- /players/[id] → Player detail page
  - Shows player info, stats, and projected value

- /results/[id] → Draft results page
  - Shows team summaries and AI grading

- /settings → Settings page
  - Lets users change preferences such as theme, default draft mode, and AI help

---

## 3. Database Schema

MongoDB will store data in separate collections. Each collection will use simple document-style structures.

### Users Collection
Collection name: users

Fields:
- _id: ObjectId
- name: string
- email: string
- passwordHash: string
- image: string
- createdAt: Date
- updatedAt: Date

### Lobbies Collection
Collection name: lobbies

Fields:
- _id: ObjectId
- name: string
- hostId: ObjectId
- status: string
  - values: waiting, active, finished
- inviteCode: string
- settings: object
  - format: string
    - values: salary-cap, no-cap
  - practiceMode: boolean
  - botOpponents: number
  - capAmount: number
- participants: ObjectId[]
- draftOrder: ObjectId[]
- currentPick: number
- createdAt: Date
- updatedAt: Date

### Players Collection
Collection name: players

Fields:
- _id: ObjectId
- fullName: string
- position: string
- team: string
- projectedValue: number
- stats: object
  - touchdowns: number
  - rushingYards: number
  - receptions: number
  - passingYards: number
- isAvailable: boolean
- createdAt: Date

### Teams Collection
Collection name: teams

Fields:
- _id: ObjectId
- lobbyId: ObjectId
- userId: ObjectId
- roster: ObjectId[]
- totalSpend: number
- remainingBudget: number
- aiGrade: number
- aiSummary: string
- createdAt: Date

### DraftEvents Collection
Collection name: draftEvents

Fields:
- _id: ObjectId
- lobbyId: ObjectId
- userId: ObjectId
- type: string
  - values: pick, bid, pass, bot-pick
- playerId: ObjectId
- amount: number
- message: string
- createdAt: Date

### AIRecommendations Collection (optional)
Collection name: aiRecommendations

Fields:
- _id: ObjectId
- lobbyId: ObjectId
- userId: ObjectId
- recommendedPlayers: ObjectId[]
- suggestedMaxBid: number
- reason: string
- createdAt: Date

---

## 4. API Endpoints

The app will use Next.js API routes for backend logic.

### Auth
- GET /api/auth/[...nextauth]
  - Handled by NextAuth.js
  - Used for login, session management, and authentication

### Lobby Routes
- GET /api/lobbies
  - Get all available lobbies

- POST /api/lobbies
  - Create a new draft lobby

- GET /api/lobbies/[id]
  - Get one lobby by ID

- POST /api/lobbies/[id]/join
  - Let a user join a lobby

- POST /api/lobbies/[id]/start
  - Start the draft session

- POST /api/lobbies/[id]/settings
  - Update draft settings such as cap mode and bot options

### Player Routes
- GET /api/players
  - Search or list players

- GET /api/players/[id]
  - Get one player’s details

### Draft Routes
- POST /api/lobbies/[id]/pick
  - Record a player pick or bid

- GET /api/lobbies/[id]/events
  - Get draft events and recent activity

### AI Routes
- GET /api/ai/recommendations
  - Return AI suggestions for a player and budget

- POST /api/ai/grade-roster
  - Grade a team after the draft

- POST /api/ai/bot-draft
  - Let an AI bot make a draft decision

---

## 5. UI Components

The frontend will use reusable components to keep the app organized.

- AppShell
  - Main layout wrapper for all pages

- Navbar
  - Top navigation bar

- AuthForm
  - Login and register form UI

- LobbyCard
  - Shows a single lobby in the lobby list

- CreateLobbyForm
  - Form for creating a new draft room

- JoinLobbyButton
  - Button used to join a lobby

- PlayerCard
  - Displays a player with name, position, team, and value

- PlayerSearchBar
  - Search box for finding players

- DraftBoard
  - Main live board showing current pick and status

- BudgetPanel
  - Shows remaining money and cap status

- TeamRosterCard
  - Displays a team’s selected players

- SettingsPanel
  - Lets users change draft mode and AI options

- BotSelector
  - Lets the host choose bot difficulty or bot strategy

- AIInsightCard
  - Shows AI recommendations or grading feedback

- EmptyState
  - Friendly message for empty lobbies or no players found

---

## 6. AI Integration Flow

The AI features should work in a simple and clear way:

1. User joins a lobby
   - The app loads the draft room and current team status.

2. The system checks draft settings
   - The app sees if the room uses salary cap mode, no-cap mode, practice mode, or bot opponents.

3. AI recommendation request is triggered
   - When a user is making a move, the app sends the current budget, roster needs, and available players to the AI route.

4. AI returns suggestions
   - The system recommends players and a suggested max bid.

5. Bot drafting runs when needed
   - If a lobby has bot opponents, the AI bot makes decisions automatically.

6. After the draft ends
   - The app sends the final team roster to the AI grading route.
   - The AI returns a score and short feedback for each team.

This flow makes the app feel smarter without making the project too hard for students to build.

---

## 7. Implementation Notes

### Step 1: Create the Next.js project
Use TypeScript and Tailwind CSS:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint
```

### Step 2: Install important packages
Useful packages for this project:

```bash
npm install mongoose next-auth socket.io-client
```

If you want to use AI APIs, install the package you plan to use, such as OpenAI.

### Step 3: Create the project structure
Suggested folders:

- app/ → pages and layouts
- components/ → UI components
- lib/ → database and helper functions
- models/ → MongoDB schemas
- types/ → TypeScript interfaces
- app/api/ → API routes

### Step 4: Connect MongoDB
Create a database connection file in the lib folder.

Example environment variables:

```env
MONGODB_URI=mongodb://localhost:27017
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=your-api-key
```

### Step 5: Build core features first
A good student-friendly build order is:

1. Home page and login page
2. Create and join lobby flow
3. Draft room UI
4. MongoDB storage for lobbies and players
5. Draft actions and real-time updates
6. AI recommendations
7. AI roster grading

### Step 6: Use TypeScript types
Create simple types for the main data:

```ts
export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Lobby {
  _id: string;
  name: string;
  hostId: string;
  status: 'waiting' | 'active' | 'finished';
}
```

This makes the project easier to understand and easier to expand later.

---

## 8. Notes for Students

This project is a great learning project because it combines:

- frontend pages
- backend API routes
- database storage
- real-time updates
- AI features

The best approach is to build the app step by step and test each part before moving to the next one.
