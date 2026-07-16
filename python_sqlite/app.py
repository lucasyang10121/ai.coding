import hashlib
import os
import sqlite3
from datetime import datetime

from flask import Flask, g, redirect, render_template_string, request, session, url_for
from markupsafe import Markup

app = Flask(__name__)
app.secret_key = 'dev-secret-key'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.environ.get('DATABASE_URL', os.path.join(BASE_DIR, 'blog.db'))

HTML_TEMPLATE = '''
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Simple Blog</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 2rem;
      background: #ff5b5b;
      color: #fff;
    }
    .container {
      max-width: 760px;
      margin: 0 auto;
      background: rgba(255,255,255,0.95);
      color: #222;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    form { max-width: 400px; }
    input, textarea {
      width: 100%;
      padding: 0.7rem;
      margin-bottom: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-sizing: border-box;
    }
    button {
      background: #d62828;
      color: white;
      border: none;
      padding: 0.7rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .nav {
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #ddd;
    }
    .nav a {
      color: #d62828;
      text-decoration: none;
      font-weight: bold;
      margin-right: 0.7rem;
    }
    .post {
      border: 1px solid #ddd;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      background: #fff7f7;
    }
    .error { color: #d62828; }
    .success { color: #0a7d2e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav">
      <a href="{{ url_for('index') }}">Home</a>
      {% if session.get('user_id') %}
        | <a href="{{ url_for('new_post') }}">Create a new post</a>
        | <a href="{{ url_for('logout') }}">Logout</a>
      {% else %}
        | <a href="{{ url_for('login') }}">Login</a>
        | <a href="{{ url_for('register') }}">Register</a>
      {% endif %}
    </div>
    {{ content }}
  </div>
</body>
</html>
'''


def get_db():
    if 'db' not in g:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        g.db = conn
    return g.db


def init_db():
    if not app.app_context().g.get('db', None):
        with app.app_context():
            db = get_db()
            db.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            ''')
            db.execute('''
                CREATE TABLE IF NOT EXISTS posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            ''')
            db.commit()
            return

    db = get_db()
    db.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    db.commit()


@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()


@app.before_request
def ensure_db():
    init_db()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def render_page(page_content: str, **context):
    return render_template_string(HTML_TEMPLATE, content=Markup(page_content), **context)


def render_page_with_markup(page_content: str, **context):
    return render_template_string(HTML_TEMPLATE, content=Markup(page_content), **context)


@app.route('/')
def index():
    posts = get_db().execute(
        'SELECT posts.id, posts.title, posts.content, posts.created_at, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC'
    ).fetchall()
    post_markup = '''
      <h1>Welcome to the Simple Blog</h1>
      <p>Read posts below or sign in to create your own.</p>
    '''
    if posts:
        for post in posts:
            post_markup += f'''
            <div class="post">
              <h2>{post['title']}</h2>
              <p>{post['content']}</p>
              <small>By {post['username']} on {post['created_at']}</small>
            </div>
            '''
    else:
        post_markup += '<p>No posts yet.</p>'
    return render_page_with_markup(post_markup)


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        if not username or not password:
            return render_page('''
              <h2>Register</h2>
              <form method="post">
                <input name="username" placeholder="Username" required>
                <input name="password" type="password" placeholder="Password" required>
                <input name="confirm_password" type="password" placeholder="Confirm Password" required>
                <button type="submit">Register</button>
              </form>
              <p class="error">Please enter a valid username and password.</p>
            ''')

        if password != confirm_password:
            return render_page('''
              <h2>Register</h2>
              <form method="post">
                <input name="username" placeholder="Username" required>
                <input name="password" type="password" placeholder="Password" required>
                <input name="confirm_password" type="password" placeholder="Confirm Password" required>
                <button type="submit">Register</button>
              </form>
              <p class="error">Passwords do not match.</p>
            ''')

        try:
            db = get_db()
            db.execute(
                'INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)',
                (username, hash_password(password), datetime.utcnow().isoformat())
            )
            db.commit()
        except sqlite3.IntegrityError:
            return render_page('''
              <h2>Register</h2>
              <form method="post">
                <input name="username" placeholder="Username" required>
                <input name="password" type="password" placeholder="Password" required>
                <input name="confirm_password" type="password" placeholder="Confirm Password" required>
                <button type="submit">Register</button>
              </form>
              <p class="error">That username is already taken.</p>
            ''')

        return redirect(url_for('login'))

    return render_page('''
      <h2>Register</h2>
      <form method="post">
        <input name="username" placeholder="Username" required>
        <input name="password" type="password" placeholder="Password" required>
        <input name="confirm_password" type="password" placeholder="Confirm Password" required>
        <button type="submit">Register</button>
      </form>
    ''')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password']
        user = get_db().execute(
            'SELECT * FROM users WHERE username = ? AND password_hash = ?',
            (username, hash_password(password))
        ).fetchone()
        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            return redirect(url_for('index'))

        return render_page('''
          <h2>Login</h2>
          <form method="post">
            <input name="username" placeholder="Username" required>
            <input name="password" type="password" placeholder="Password" required>
            <button type="submit">Login</button>
          </form>
          <p class="error">Invalid username or password.</p>
        ''')

    return render_page('''
      <h2>Login</h2>
      <form method="post">
        <input name="username" placeholder="Username" required>
        <input name="password" type="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
    ''')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


@app.route('/posts/new', methods=['GET', 'POST'])
def new_post():
    if not session.get('user_id'):
        return render_page('''
          <h2>Create a new post</h2>
          <p class="error">Please log in to create a post.</p>
        ''')

    if request.method == 'POST':
        title = request.form['title'].strip()
        content = request.form['content'].strip()
        if title and content:
            get_db().execute(
                'INSERT INTO posts (user_id, title, content, created_at) VALUES (?, ?, ?, ?)',
                (session['user_id'], title, content, datetime.utcnow().isoformat())
            )
            get_db().commit()
            return redirect(url_for('index'))

        return render_page('''
          <h2>Create a new post</h2>
          <form method="post">
            <input name="title" placeholder="Title" required>
            <textarea name="content" rows="6" placeholder="Write your post here" required></textarea>
            <button type="submit">Publish</button>
          </form>
          <p class="error">Title and content are required.</p>
        ''')

    return render_page('''
      <h2>Create a new post</h2>
      <form method="post">
        <input name="title" placeholder="Title" required>
        <textarea name="content" rows="6" placeholder="Write your post here" required></textarea>
        <button type="submit">Publish</button>
      </form>
    ''')


if __name__ == '__main__':
    app.run(debug=True)
