# External Modules
from sqlalchemy import Boolean, Column, ForeignKey, JSON, LargeBinary, String, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

# character varying = String
# bytea = LargeBinary
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String(16), nullable=False, primary_key=True)
    username = Column(String(255), unique=True)
    email = Column(String(255), unique=True)
    pwd_hash = Column(LargeBinary)

    verification = relationship(
        "Verification",
        back_populates="user",
        uselist=False,
        primaryjoin="User.id == Verification.id"
    )
    chats = relationship(
        "Chats",
        back_populates="user",
        primaryjoin="User.id == Chats.user_id"
    )


class Verification(Base):
    __tablename__ = "verification"

    id = Column(String(16), ForeignKey("users.id"),
                nullable=False, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    otp = Column(String(6))
    otp_expiry = Column(TIMESTAMP)
    verified = Column(Boolean, nullable=False, default=False)

    user = relationship(
        "User",
        back_populates="verification",
        primaryjoin="User.id == Verification.id"
    )


class Chats(Base):
    __tablename__ = "chats"

    id = Column(String, nullable=False, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    messages = Column(JSON, nullable=False)

    user = relationship(
        "User",
        back_populates="chats",
        primaryjoin="User.id == Chats.user_id"
    )
