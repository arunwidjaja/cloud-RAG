# External Modules
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import BackgroundTasks, HTTPException

import bcrypt
import config
import random
import smtplib
import sqlite3
import string
import uuid

# Local Modules
from paths import get_paths


class UserAuth:
    def __init__(self):
        """Initialize the UserAuth system with a SQLite database."""
        self.db_path = get_paths().AUTH / "users.db"

        self.smtp_server: str = config.SMTP_SERVER
        self.smtp_port: int = config.SMTP_PORT
        self.smtp_username: str = config.SMTP_USERNAME
        self.smtp_password: str = config.SMTP_PASSWORD
        self.otp_lifespan_minutes: int = config.OTP_LIFESPAN_MINUTES

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
        """Generate a random OTP of specified length"""
        otp = ''.join(random.choices(string.digits, k=length))
        return otp

    def update_otp(self, email: str):
        """updates the verification DB with a new OTP"""
        new_otp = self.generate_otp()
        cur_time = datetime.now(timezone.utc)
        exp_time = timedelta(minutes=self.otp_lifespan_minutes)
        otp_expiry = cur_time + exp_time
        print(f"Updating OTP for {email}...")
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        try:
            c.execute("""
                UPDATE email_verifications
                SET otp = ?, otp_expiry = ?
                WHERE email = ? AND verified != 1
            """, (new_otp, otp_expiry, email))
            conn.commit()
        except sqlite3.Error as e:
            conn.rollback()
            raise Exception(f"OTP error: {str(e)}")
        finally:
            conn.close()

    def send_verification_email(self, email: str, otp: str):
        """Send verification email with OTP."""
        try:
            print(f"Sending verification email")
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username
            msg['To'] = email
            msg['Subject'] = f"Your RAGbase Code is: {otp}"

            body = f"""
            Thank you for signing up with RAGbase!

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

    def register_user(self, email: str, password: str, background_tasks: BackgroundTasks) -> bool:
        """
        Register a new user with the given username and password.

        Returns:
            TRUE if the email is successfully registered and awaiting verification.

            FALSE if the email is already registered and verified.
        """
        is_user_duplicate = False
        is_user_unverified = False
        is_user_new = False

        conn = sqlite3.connect(self.db_path)

        # Generate user ID and hash password
        user_id = str(uuid.uuid4())
        password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt(rounds=12)
        )
        # Generate an OTP
        otp = self.generate_otp()
        otp_expiry = datetime.now(
            timezone.utc) + timedelta(minutes=self.otp_lifespan_minutes)

        try:
            print(f"Connecting to auth DB: {self.db_path}")
            c = conn.cursor()
            print(f"Checking if {email} is unique")
            c.execute("""
                SELECT username
                FROM users
                WHERE username = ?
            """, (email,))
            result = c.fetchone()

            # If an existing email is found...
            if result is not None:
                existing_email = result[0]
                # Check if the email is verified yet
                c.execute("""
                        SELECT verified
                        FROM email_verifications
                        WHERE email = ?
                    """, (existing_email,))
                result = c.fetchone()
                if result is not None:
                    is_verified = result[0]
                else:
                    # This else block should never execute
                    is_verified = False
                    print(f"Could not find {email} in the verification DB!")

                if is_verified:
                    is_user_duplicate = True
                else:
                    is_user_unverified = True
            # If email doesn't exist yet, create the user and add the email to the auth DB
            else:
                is_user_new = True

            if is_user_new:
                # Generate OTP and add email to verification DB
                print(f"Adding {email} to verification database")
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
                background_tasks.add_task(
                    self.send_verification_email, email, otp)

                print("New user registered. Email verification sent.")
                return True
            elif is_user_unverified:
                print(f"{email} is registered but not yet verified. Resending OTP.")
                conn.commit()
                conn.close()  # Close existing connectiong before updating DB
                self.update_otp(email)
                background_tasks.add_task(
                    self.send_verification_email, email, otp)
                print("Verification email has been sent.")
                return True
            elif is_user_duplicate:
                print(
                    f"{email} is already registered and verified. User needs to log in.")
                conn.commit()
                return False
            else:
                print(
                    f"Unhandled user registration state. Please look into this. You should not see this message.")
                conn.commit()
                return False
        except sqlite3.Error as e:
            print(f"Auth DB error: {str(e)}")
            raise
        finally:
            conn.close()

    def delete_user(self, username: str, password: str) -> bool:
        """
        Deletes the user if the username and password match
        """
        user_id = self.validate_user(username, password)
        if (user_id):
            try:
                with sqlite3.connect(self.db_path) as conn:
                    conn.execute(
                        "DELETE FROM users WHERE username = ?",
                        (username,)
                    )
                    conn.execute(
                        "DELETE FROM email_verifications WHERE email = ?",
                        (username,)
                    )
                return True
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
            str: The requested value if found, "" if not found
        """

        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                query = f"SELECT {value} FROM users WHERE id = ?"
                cursor.execute(query, (user_id,))

                result = cursor.fetchone()
            return result[0] if result else ""
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            raise
