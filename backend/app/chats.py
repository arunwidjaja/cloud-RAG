# External Modules
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from typing import List

import json


# Local Modules
from api_MODELS import ChatModel, MessageModel
from database_manager import DatabaseManager
from schema import Chats


def save_chat(dbm: DatabaseManager, chat: ChatModel) -> str:
    chat_id: str = chat.id
    user_id: str = dbm.uuid
    subject: str = chat.subject
    messages: str = json.dumps(
        [message.model_dump() for message in chat.messages]
    )
    try:
        with Session(dbm.get_connection()) as session:
            chat = Chats(
                id=chat_id,
                user_id=user_id,
                subject=subject,
                messages=messages
            )
            session.merge(chat)
            session.commit()
        return chat_id
    except Exception as e:
        print(str(e))
        raise Exception(f"Error saving chat: {str(e)}")


def parse_messages(json_messages_list: str) -> List[MessageModel]:
    raw_messages = json.loads(json_messages_list)
    messages = [MessageModel(**msg) for msg in raw_messages]
    return messages


def get_chats(dbm: DatabaseManager) -> List[ChatModel]:
    user_id: str = dbm.uuid
    chats: List[ChatModel] = []

    try:
        with Session(dbm.get_connection()) as session:
            query = select(
                Chats.id,
                Chats.subject,
                Chats.messages
            ).where(Chats.user_id == user_id)
            results = session.execute(query)

            for row in results:
                chat_id = row[0]
                subject = row[1]
                messages = parse_messages(row[2])
                chat = ChatModel(
                    id=chat_id,
                    subject=subject,
                    messages=messages
                )
                chats.append(chat)
            return chats
    except Exception as e:
        print(str(e))
        raise Exception(f"Error getting chats: {str(e)}")


def delete_chat(dbm: DatabaseManager, chat_id: str) -> str:
    try:
        with Session(dbm.get_connection()) as session:
            print(f"Deleting Chat #{chat_id}")
            query = delete(Chats).where(Chats.id == chat_id)
            result = session.execute(query)
            session.commit()
            return chat_id if result.rowcount > 0 else ""

    except Exception as e:
        print(str(e))
        raise Exception(f"Error deleting chat: {str(e)}")
    return ""
