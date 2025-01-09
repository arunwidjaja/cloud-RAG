# External Modules
import hashlib
import random
import string

# Local Modules
import config


def generate_otp(length: int = 6) -> str:
    """
    Generates a random OTP of specified length

    Returns:
        OTP string
    """
    otp = ''.join(random.choices(string.digits, k=length))
    return otp


def generate_uuid(username: str, email: str) -> str:
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
    encoding = config.ENCODING

    # strip and combined username and email
    username_stripped = username.strip().lower()
    email_stripped = email.strip().lower()
    combined = f"{username_stripped}{email_stripped}"

    # Hash the combined string
    hash_obj = hashlib.sha256(combined.encode(encoding))

    # Convert to hexadecimal to get only alphanumeric characters
    hash_hex = hash_obj.hexdigest()

    # Take first 16 characters
    uuid = hash_hex[:length]

    return uuid
