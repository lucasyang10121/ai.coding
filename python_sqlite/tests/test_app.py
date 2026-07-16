import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, init_db


class BlogAppTests(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp()
        os.environ['DATABASE_URL'] = self.db_path
        self.app = app.test_client()
        self.app.testing = True
        init_db()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_home_page_shows_posts_and_login_links(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Welcome', response.data)
        self.assertIn(b'Login', response.data)
        self.assertIn(b'Register', response.data)

    def test_register_and_login_flow(self):
        response = self.app.post('/register', data={
            'username': 'alice',
            'password': 'secret123',
            'confirm_password': 'secret123'
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Login', response.data)

        login_response = self.app.post('/login', data={
            'username': 'alice',
            'password': 'secret123'
        }, follow_redirects=True)
        self.assertEqual(login_response.status_code, 200)
        self.assertIn(b'Create a new post', login_response.data)

    def test_only_logged_in_users_can_post(self):
        response = self.app.post('/posts/new', data={
            'title': 'Hello',
            'content': 'World'
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Please log in', response.data)

        self.app.post('/register', data={
            'username': 'bob',
            'password': 'pass123',
            'confirm_password': 'pass123'
        })
        self.app.post('/login', data={
            'username': 'bob',
            'password': 'pass123'
        })

        logged_in_response = self.app.post('/posts/new', data={
            'title': 'Hello',
            'content': 'World'
        }, follow_redirects=True)
        self.assertEqual(logged_in_response.status_code, 200)
        self.assertIn(b'Hello', logged_in_response.data)


if __name__ == '__main__':
    unittest.main()
