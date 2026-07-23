# Test Cases for Custom Draft Simulator

## 1. Manual Test Steps

### Start the app
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file:
   ```bash
   copy .env.local.example .env.local
   ```
3. Update the values in .env.local.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000 in your browser.

### Test the home page
- Open the home page.
- Confirm the main heading and links appear.

### Test creating a lobby
- Go to /lobbies/create.
- Enter a lobby name and choose a format.
- Click Create Lobby.
- Confirm you are redirected to the lobby page.

### Test joining a lobby
- Open the lobbies page.
- Click View Lobby on an existing room.
- Confirm the lobby details appear.

### Test the draft board
- Open /lobbies/[id]/draft.
- Choose a player from the dropdown.
- Click Make Pick.
- Confirm the pick action works.

### Test AI suggestions
- Open the draft page.
- Click Ask AI for Suggestion.
- Confirm a recommended player and suggested bid appear.

### Test the results page
- Open /results/1.
- Confirm the AI score and summary appear.

---

## 2. API Test Steps

### Test GET /api/lobbies
- Open http://localhost:3000/api/lobbies.
- Confirm the API returns a list of lobbies.

### Test POST /api/lobbies
- Send a POST request with JSON body containing name and settings.
- Confirm a new lobby is created.

### Test GET /api/lobbies/[id]
- Use an existing lobby ID.
- Confirm the correct lobby data is returned.

### Test POST /api/lobbies/[id]/join
- Send a POST request with a userId.
- Confirm the user is added to the lobby participants.

### Test GET /api/players
- Open http://localhost:3000/api/players.
- Confirm the sample players appear.

### Test POST /api/ai/recommendations
- Send a POST request with a budget and position.
- Confirm an AI response is returned.

### Test POST /api/ai/grade-roster
- Send a POST request with a roster length.
- Confirm a score and summary are returned.

---

## 3. UI Test Steps

### Home page UI
- Confirm the page is visually clear and easy to read.
- Check that buttons go to the correct pages.

### Lobby UI
- Confirm lobby cards display name, status, and invite code.

### Draft UI
- Confirm the player dropdown works.
- Confirm the AI suggestion area updates properly.

### Player UI
- Confirm player cards show position and projected value.

---

## 4. AI Test Steps

### Bot-style suggestion test
- Open the draft page.
- Click Ask AI for Suggestion.
- Confirm the response contains a player recommendation and max bid.

### Roster grading test
- Open the results page.
- Confirm the AI score and summary appear.

---

## 5. Optional Automated Testing

Students can also add Jest or Vitest later for automated tests.

Example idea:
- test API routes
- test form submissions
- test AI response structure

This is optional, but it is a great next step once the app is working.

---

## 6. Troubleshooting Tips

### MongoDB connection error
- Make sure MONGODB_URI is correct.
- If using MongoDB Atlas, check your network access.
- If using a local MongoDB server, confirm it is running.

### OpenAI API key issue
- Make sure OPENAI_API_KEY is set in .env.local.
- Confirm the key is valid and not expired.
- If AI features are not needed yet, the app still works with the simple built-in mock logic.

### App not loading
- Run npm install first.
- Ensure the development server is running with npm run dev.
- Check the browser console for any runtime errors.
