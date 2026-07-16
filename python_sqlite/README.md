# Simple Blog with Flask and SQLite

This project is a lightweight blog application built with Python, Flask, and SQLite.

## Features
- User registration
- User login and logout
- Protected posting for authenticated users
- Public listing of blog posts

## Requirements
- Python 3.10+
- Flask

## Getting started
1. Create and activate a virtual environment (optional but recommended)
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the app:
   ```bash
   python app.py
   ```
4. Open http://127.0.0.1:5000 in your browser

## Running tests
Run the test suite with:
```bash
python -m unittest discover -s tests -v
```

## Project structure
- app.py: Flask application and routes
- blog.db: SQLite database file created automatically
- tests/: regression tests for auth and posting flows


<img width="1920" height="1200" alt="image" src="https://github.com/user-attachments/assets/0349c2b4-1d56-4982-a819-3ab3090f5269" />
