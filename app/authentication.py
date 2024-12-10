from imports import *

# Local Modules
import utils


class UserAuth:
    def __init__(self):
        """Initialize the UserAuth system with a SQLite database."""
        self.db_path = utils.get_env_paths()['AUTH'] / "users.db"
        self._init_db()

    def _init_db(self) -> None:
        # Creating the users table if it doesn't exist
        print(f"Attempting to connect to: {self.db_path}")
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY UNIQUE,
                        username TEXT UNIQUE,
                        password_hash TEXT NOT NULL
                    )
                """)
        except sqlite3.Error as e:
            print(f"SQLite error: {str(e)}")
            raise

    def validate_user(self, username: str, password: str) -> str:
        """
        Validate a login attempt.
        Returns user id if credentials are valid, False otherwise.
        """
        try:
            print(f"Validating credentials against db: {self.db_path}")
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    "SELECT id, password_hash FROM users WHERE username = ?",
                    (username,)
                )
                row = cursor.fetchone()

                if not row:
                    return None  # Username not found

                user_id, stored_hash = row

                # Convert string back to bytes
                stored_hash = stored_hash.encode('utf-8')

                # bcrypt.checkpw handles all the salt extraction and comparison
                if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
                    return user_id
                return None

        except sqlite3.Error as e:
            print(f"Auth DB error: {str(e)}")
            raise

    def register_user(self, username: str, password: str) -> str:
        """
        Register a new user with the given username and password.
        Returns True if successful, False if username already exists.
        """
        try:
            # Generate salt and hash password
            password_hash = bcrypt.hashpw(
                password.encode('utf-8'),
                bcrypt.gensalt(rounds=12)
            )
            # Generate UUID
            user_id = str(uuid.uuid4())

            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    "INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)",
                    # Store hash as string
                    (user_id, username, password_hash.decode('utf-8'))
                )
            return user_id
        except sqlite3.Error as e:
            print(f"Auth DB error: {str(e)}")
            return None  # Username already exists

    def delete_user(self, username: str, password: str) -> bool:
        """
        Deletes the user if the username and password match
        """
        validated = self.validate_user(username, password)
        if (validated):
            try:
                with sqlite3.connect(self.db_path) as conn:
                    cursor = conn.execute(
                        "DELETE FROM users WHERE username = ?",
                        (username,)
                    )
                    return cursor.rowcount > 0
            except sqlite3.Error as e:
                print(f"Auth DB error: {e}")
                return False
        else:
            return False

    def query_user_data(self, user_id: str, value: str) -> str:
        """
        Get the requested value from the user table based on the id

        Args:
            user_id (str): The UUID to look up
            value (str): The column name to retrieve

        Returns:
            Optional[str]: The requested value if found, None if not found
        """

        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                query = f"SELECT {value} FROM users WHERE id = ?"
                cursor.execute(query, (user_id,))

                result = cursor.fetchone()
            return result[0] if result else None
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            raise
