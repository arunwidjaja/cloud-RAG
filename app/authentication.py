from imports import *

# Local Modules
import config
import utils


class UserAuth:
    def __init__(self):
        """Initialize the UserAuth system with a SQLite database."""
        self.db_path = utils.get_env_paths()['AUTH'] / "users.db"

        self.smtp_server = config.SMTP_SERVER
        self.smtp_port = config.SMTP_PORT
        self.smtp_username = config.SMTP_USERNAME
        self.smtp_password = config.SMTP_PASSWORD
        self.otp_lifespan_minutes = config.OTP_LIFESPAN_MINUTES

        self._init_db()

    def _init_db(self) -> None:
        # Creating the users and verification tables if it doesn't exist
        print(f"Attempting to connect to: {self.db_path}")
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Create users table
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY UNIQUE,
                        username TEXT UNIQUE,
                        password_hash TEXT NOT NULL
                    )
                """)

                # Create email verification table
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS email_verifications (
                        user_id TEXT,
                        email TEXT NOT NULL,
                        otp TEXT,
                        otp_expiry TIMESTAMP,
                        verified BOOLEAN DEFAULT FALSE,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                        PRIMARY KEY (user_id, email)
                    )
                """)

        except sqlite3.Error as e:
            print(f"SQLite error: {str(e)}")
            raise

    def generate_otp(self, length: int = 6) -> str:
        "Generate a random OTP of specified length"
        otp = ''.join(random.choices(string.digits, k=length))
        return otp

    def send_verification_email(self, email: str, otp: str):
        """Send verification email with OTP."""
        try:
            print(f"Sending verification email")
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username
            msg['To'] = email
            msg['Subject'] = "RAGbase OTP Verification"

            body = f"""
            Welcome to RAGbase!

            Your verification code is: {otp}

            This code will expire in {self.otp_lifespan_minutes} minutes.

            If you did not request this verification, please ignore this email.
            """

            msg.attach(MIMEText(body, 'plain'))

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
        except Exception as e:
            print(f"Error sending verification email: {e}")
            return False

    def validate_user(self, username: str, password: str) -> str | None:
        """
        Validate a login attempt.

        Returns:
            user ID or None
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

    async def verify_email(self, email: str, otp: str) -> bool:
        """Verify email with OTP"""

        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        try:
            c.execute("""
                SELECT otp, otp_expiry, verified
                FROM email_verifications
                WHERE email = ?
                ORDER BY otp_expiry DESC LIMIT 1
            """, (email,))

            result = c.fetchone()
            if not result:
                print(f"{email} was not found in the database.")
                raise HTTPException(status_code=404, detail="Email not found")

            stored_otp, otp_expiry, is_verified = result

            print(f"Checking OTP: {otp} against email: {email}")
            # Check if email is already verified
            if is_verified:
                print(f"This email is already verified.")
                raise HTTPException(
                    status_code=400, detail="Email already verified.")

            # Check OTP expiry
            if datetime.now(timezone.utc) > datetime.fromisoformat(otp_expiry).replace(tzinfo=timezone.utc):
                print(f"This OTP is expired.")
                return False

            # Verify OTP
            if otp != stored_otp:
                print(f"This OTP is incorrect.")
                return False

            print(f"{email} is verified!")
            c.execute("""
                UPDATE email_verifications
                SET verified = TRUE, otp = NULL, OTP_EXPIRY = NULL
                WHERE email = ?
            """, (email,))

            conn.commit()
            return True

        finally:
            conn.close()

    def register_user(self, email: str, password: str, background_tasks: BackgroundTasks) -> str:
        """
        Register a new user with the given username and password.
        Returns True if successful, False if username already exists.
        """
        try:
            # Generate user ID and pwd hash
            user_id = str(uuid.uuid4())
            password_hash = bcrypt.hashpw(
                password.encode('utf-8'),
                bcrypt.gensalt(rounds=12)
            )

            # Open database connection
            print(f"Connecting to authentication database: {self.db_path}")
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()

            # Check for an existing verified email
            print(f"Checking if {email} is unique")
            c.execute("""
                SELECT username
                FROM users
                WHERE username = ?""", (email,))
            if c.fetchone():
                raise HTTPException(
                    status_code=400, detail="Username already taken")

            # Generate OTP and add email to verification DB
            otp = self.generate_otp()
            otp_expiry = datetime.now(
                timezone.utc) + timedelta(minutes=self.otp_lifespan_minutes)
            print(f"Adding email and OTP to verification database")
            c.execute("""
                INSERT INTO email_verifications (user_id, email, otp, otp_expiry, verified)
                VALUES (?, ?, ?, ?, FALSE)
            """, (user_id, email, otp, otp_expiry))

            # Create user and add to the users database
            print(f"Adding user to database")
            c.execute("""
                INSERT INTO users (id, username, password_hash)
                VALUES (?, ?, ?)
            """, (user_id, email, password_hash.decode('utf-8')))

            conn.commit()

            background_tasks.add_task(self.send_verification_email, email, otp)
            return user_id
        except sqlite3.Error as e:
            print(f"Auth DB error: {str(e)}")
            return None  # Email/username already exists

    def delete_user(self, username: str, password: str) -> bool:
        """
        Deletes the user if the username and password match
        """
        user_id = self.validate_user(username, password)
        if (user_id):
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
