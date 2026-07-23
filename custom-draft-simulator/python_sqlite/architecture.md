# Architecture Overview

## High-Level Structure
The blog app will follow a simple three-layer architecture:

1. Presentation Layer
   - HTML templates for login, registration, post list, and post form
   - CSS for styling
   - Minimal JavaScript for form interactions

2. Application Layer
   - Python backend handling routes and business logic
   - Session-based authentication for login state
   - Access control for protected post actions

3. Data Layer
   - SQLite database file for users and blog posts
   - SQL queries for create, read, and authenticate operations

## Core Components
- app.py: main entry point and route definitions
- templates/: HTML files for each page
- static/: CSS and JS assets
- database.py or db.py: SQLite setup and helper functions

## Database Design
### users
- id (INTEGER, PRIMARY KEY)
- username (TEXT, UNIQUE)
- password_hash (TEXT)
- created_at (TEXT)

### posts
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- title (TEXT)
- content (TEXT)
- created_at (TEXT)

## Authentication Flow
- Register creates a new user record
- Login checks username and password hash
- Session cookie stores the authenticated user
- Protected routes require an active session

## Request Flow
- User opens the site
- App loads posts from SQLite
- Logged-in user can access the new post form
- Submitted post is validated and stored
- Post appears in the main listing
