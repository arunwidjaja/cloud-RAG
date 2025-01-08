# External Modules
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import BackgroundTasks
from sqlalchemy import create_engine, Engine, text
from sqlalchemy.orm import Session

import base64
import bcrypt
import hashlib
import random
import smtplib
import string

import config


class UserAuth:
    def __init__(self):
        """
        Initializes the User Authentication system.
        Connects to email server and authentication database.
        """
        # email server configuration
        self.smtp_server: str = config.SERVER_SMTP
        self.smtp_port: int = config.PORT_SMTP
        self.smtp_username: str = config.USERNAME_SMTP
        self.smtp_password: str = config.PASSWORD_SMTP
        self.otp_lifespan_minutes: int = config.OTP_LIFESPAN_MINUTES

        # authentication db configuration
        self.encoding: str = config.ENCODING
        self.db_username: str = config.USERNAME_DB_AUTH
        self.db_password: str = config.PASSWORD_DB_AUTH
        self.db_port: int = config.PORT_DB_AUTH_RDS
        self.db_host: str = config.HOST_DB_AUTH_RDS
        self.db = config.DB_AUTH
        self.db_table_users = config.TABLE_USERS
        self.db_table_verification = config.TABLE_VERIFICATION

        self.db_connection = self.get_connection()
        print("User Authentication DB initialized.")

    def get_connection(self) -> Engine:
        """
        Gets the connection to the authentication database

        Returns:
            sqlalchemy engine object.
        """
        try:
            connection_string = (
                f"postgresql+psycopg2://"
                f"{self.db_username}:"
                f"{self.db_password}"
                f"@{self.db_host}:"
                f"{self.db_port}"
                f"/{self.db}"
            )
            engine = create_engine(connection_string)
            return engine
        except Exception as e:
            print(f"Error connecting to the Authentication DB: {e}")
            raise

    def generate_otp(self, length: int = 6) -> str:
        """
        Generates a random OTP of specified length

        Returns:
            OTP string
        """
        otp = ''.join(random.choices(string.digits, k=length))
        return otp

    def generate_uuid(self, username: str, email: str) -> str:
        """
        Generates a UUID of specified length.
        This is NOT compatible with PostgreSQL UUID type.
        The UUID is always the same given the same username and email.

        Args:
            username: username
            email: email

        Returns:
            UUID string
        """
        length = config.UUID_LENGTH

        # strip and combined username and email
        username_stripped = username.strip().lower()
        email_stripped = email.strip().lower()
        combined = f"{username_stripped}{email_stripped}"

        # hash, make URL safe, and truncate to desired length
        hash_obj = hashlib.sha256(combined.encode(self.encoding))
        hash_b64 = base64.urlsafe_b64encode(
            hash_obj.digest()).decode(self.encoding)
        hash_b64 = hash_b64.rstrip('=')[:length]

        uuid = hash_b64.ljust(length, '0')

        return uuid

    def get_user_data(self, uuid: str, value: str) -> str:
        """
        Get the requested value from the user table based on the id

        Args:
            uuid (str): The UUID to look up
            value (str): The column name to retrieve

        Returns:
            str: The requested value

        Raises:
            ValueError: If the value (column) doesn't exist
            Exception: If the user is not found or other database errors
        """
        # Fetches the requested data
        query_get_data = text(f"""
            SELECT {value}
            FROM {self.db_table_users}
            WHERE id = :uuid
        """)
        try:
            with Session(self.db_connection) as session:
                result = session.execute(query_get_data, {"uuid": uuid})
                row = result.first()
                if row is None:
                    raise Exception(f"User with UUID {uuid} not found")
                else:
                    val: str = row[0]
                    return val
        except Exception as e:
            raise Exception(f"Error retrieving user data: {str(e)}")

    def validate_user(self, username: str, password: str) -> str | None:
        """
        Validates user credentials.

        Args:
            username: username
            password: password

        Returns:
            UUID if valid, None otherwise.
        """

        # Fetches UUID and hashed password
        query_get_creds = text(f"""
            SELECT id, pwd_hash
            FROM {self.db_table_users}
            WHERE username = :username
        """)
        try:
            with Session(self.db_connection) as session:
                result = session.execute(
                    query_get_creds,
                    {"username": username}
                )
                # Returns none if username isn't found.
                row = result.first()
                if row is None:
                    return None

                uuid, pwd_hash = row
                is_valid = bcrypt.checkpw(
                    password.encode(self.encoding),
                    bytes(pwd_hash)
                )
                return uuid if is_valid else None
        except (ValueError, TypeError):
            return None

    def update_otp(self, email: str) -> None:
        """
        Updates verification table with an OTP

        Args:
            email: email
        """
        otp = self.generate_otp()
        cur_time = datetime.now(timezone.utc)
        exp_time = timedelta(minutes=self.otp_lifespan_minutes)
        otp_expiry = cur_time + exp_time

        # Sets an email's OTP
        query_verify_email = text(f"""
            UPDATE {self.db_table_users}
            SET otp = :otp, otp_expiry = :otp_expiry
            WHERE email = :email
            AND verified = FALSE
        """)
        try:
            with Session(self.db_connection) as session:
                session.execute(
                    query_verify_email,
                    {"otp": otp,
                     "otp_expiry": otp_expiry,
                     "email": email}
                )
                session.commit()
        except Exception as e:
            raise Exception(f"Error generating OTP: {str(e)}")

    async def verify_otp(self, email: str, otp: str) -> bool:
        """
        Verifies an OTP against the database.
        Updates email to verified if the OTP matches.

        1. email not found.
        2. OTP does not match or is expired.
        3. email already verified, or otp is succeeds

        Args:
            email: email
            otp: otp

        Returns:
            True if the OTP is valid, False otherwise
        """
        # Fetches OTP for verification purposes
        query_fetch_data = text(f"""
            SELECT otp, otp_expiry, verified
            FROM {self.db_table_verification}
            WHERE email = :email
            ORDER BY otp_expiry DESC LIMIT 1
        """)
        # Sets email to verified status
        query_verify_email = text(f"""
            UPDATE {self.db_table_verification}
            SET verified = TRUE, otp = NULL, OTP_EXPIRY = NULL
            WHERE email = :email
        """)
        # Sets the email in the users table to the verified email
        query_update_user_email = text(f"""
            UPDATE {self.db_table_users} u
            SET email = :email
            WHERE u.id = (
                    SELECT v.id
                    FROM {self.db_table_verification} v
                    WHERE v.email = :email
                )
        """)

        try:
            with Session(self.db_connection) as session:
                # Fetch data
                result = session.execute(
                    query_fetch_data,
                    {"email": email}
                )
                row = result.first()
                if row is None:
                    print("Email not found!")
                    return False
                otp_stored, otp_expiry, verified = row

                # Check if email already verified or if OTP is invalid
                if verified:
                    print("This email is already verified!")
                    return True
                if otp != otp_stored:
                    print("OTP does not match!")
                    return False
                if datetime.now(timezone.utc) > otp_expiry:
                    print("OTP is expired!")
                    return False

                # Validate user
                session.execute(
                    query_verify_email,
                    {"email": email}
                )
                # Add user's validated email to the user table
                session.execute(
                    query_update_user_email,
                    {"email": email}
                )
                print("Email is now verified!")
                session.commit()
                return True
        except Exception as e:
            raise Exception(f"Error verifying OTP: {str(e)}")

    def register_user(self, username: str, email: str, password: str, background_tasks: BackgroundTasks) -> bool:
        """
        Registers a new user with the given username, email, and password.

        Returns:
            TRUE if the username and email are available.
            FALSE if they are not.
        """
        # Generates UUID and hash password
        uuid = self.generate_uuid(username, email)
        password_hash = bcrypt.hashpw(
            password.encode(self.encoding),
            bcrypt.gensalt(rounds=12)
        )
        # Generates an OTP
        otp = self.generate_otp()
        otp_expiry = datetime.now(
            timezone.utc) + timedelta(minutes=self.otp_lifespan_minutes)

        # Checks for a registered username
        query_check_user = text(f"""
            SELECT EXISTS(
                SELECT 1
                FROM {self.db_table_users}
                WHERE username = :username
            ) AS user_taken
        """)
        # Checks for a registered email
        query_check_email = text(f"""
            SELECT EXISTS(
                SELECT 1
                FROM {self.db_table_users}
                WHERE email = :email
            ) AS email_taken
        """)
        # Adds email to the verification table
        query_add_email = text(f"""
            INSERT INTO {self.db_table_verification}
            (id, email, otp, otp_expiry)
            VALUES (:id, :email, :otp, :otp_expiry)
        """)
        # Adds user to the users table (without email)
        query_add_user = text(f"""
            INSERT INTO {self.db_table_users}
            (id, username, pwd_hash)
            VALUES (:id, :username, :pwd_hash)
        """)
        try:
            with Session(self.db_connection) as session:
                username_taken = session.execute(
                    query_check_user,
                    {"username": username}
                )
                email_taken = session.execute(
                    query_check_email,
                    {"email": email}
                )
                is_taken = username_taken.scalar() or email_taken.scalar()

                # Return False if username or email is already taken and verified.
                if is_taken:
                    return False

                # Add user to users table (without email)
                session.execute(
                    query_add_user,
                    {"id": uuid,
                     "username": username,
                     "pwd_hash": password_hash}
                )

                # Add email to verification table
                session.execute(
                    query_add_email,
                    {"id": uuid,
                     "email": email,
                     "otp": otp,
                     "otp_expiry": otp_expiry}
                )
                self.send_verification_email(email, otp)
                session.commit()
                return True
        except Exception as e:
            raise Exception(f"Error registering user: {str(e)}")

    def delete_user(self, username: str, password: str) -> bool:
        """
        Deletes the user if the username and password match
        """
        uuid = self.validate_user(username, password)
        query_delete_user = text(f"""
            DELETE FROM {self.db_table_users} WHERE id = :uuid
        """)
        query_delete_verification = text(f"""
            DELETE FROM {self.db_table_verification} WHERE id = :uuid
        """)
        if (uuid):
            try:
                with Session(self.db_connection) as session:
                    session.execute(query_delete_user, {"user": uuid})
                    session.execute(query_delete_verification, {"user": uuid})
                    session.commit()
                    return True
            except Exception as e:
                print(f"Error deleting user: {e}")
                return False
        else:
            return False

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


def main():
    print("Running authentication.py")


if __name__ == '__main__':
    main()
