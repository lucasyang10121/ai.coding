# Design Notes

## User Experience
The interface should stay simple and focused:
- Home page lists all published blog posts
- Register page allows creating a new account
- Login page allows signing in
- Post page is available only to logged-in users

## Page Design
### Home Page
- Show title and list of posts
- Show login/register links when logged out
- Show logout and new post link when logged in

### Register Page
- Form fields: username, password, confirm password
- Validate that passwords match
- Show success or error message

### Login Page
- Form fields: username, password
- Redirect to home page after successful login

### New Post Page
- Fields: title and content
- Only accessible to authenticated users
- On success, redirect back to home page

## Security Considerations
- Store password hashes instead of plain text
- Use session management for login state
- Restrict posting routes to authenticated users only
- Escape user input before rendering in HTML

## Suggested Routes
- GET /: home page with posts
- GET /register: registration form
- POST /register: create new user
- GET /login: login form
- POST /login: authenticate user
- POST /logout: end session
- GET /post: create post form
- POST /post: save new post

## Implementation Notes
- Use Flask's session object for authentication
- Use SQLite3 for database access
- Keep the initial version minimal and easy to extend later
