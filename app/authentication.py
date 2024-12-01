from imports import *

# Local Modules
import utils


class UserAuth:
    def __init__(self):
        """Initialize the UserAuth system with a SQLite database."""
        self.db_path = utils.get_env_paths()['auth']
        self._init_db()

    def _init_db(self) -> None:
        """Create the users table if it doesn't exist."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY,
                    password_hash TEXT NOT NULL
                )
            """)

    def register_user(self, username: str, password: str) -> bool:
        """
        Register a new user with the given username and password.
        Returns True if successful, False if username already exists.
        """
        try:
            # Generate salt and hash password
            password_hash = bcrypt.hashpw(
                password.encode('utf-8'),
                # Work factor of 12 is a good default
                bcrypt.gensalt(rounds=12)
            )

            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                    # Store hash as string
                    (username, password_hash.decode('utf-8'))
                )
            return True
        except sqlite3.IntegrityError:
            return False  # Username already exists

    def validate_login(self, username: str, password: str) -> bool:
        """
        Validate a login attempt.
        Returns True if credentials are valid, False otherwise.
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT password_hash FROM users WHERE username = ?",
                (username,)
            )
            row = cursor.fetchone()

            if not row:
                return False  # Username not found

            # Convert string back to bytes
            stored_hash = row[0].encode('utf-8')

            # bcrypt.checkpw handles all the salt extraction and comparison
            return bcrypt.checkpw(password.encode('utf-8'), stored_hash)
