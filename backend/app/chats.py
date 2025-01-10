# External Modules
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import List

import json


# Local Modules
from api_MODELS import ChatModel
from database_manager import DatabaseManager
from schema import Chats


def save_chat(dbm: DatabaseManager, chat: ChatModel) -> str:
    chat_id: str = chat.id
    user_id: str = dbm.uuid
    subject: str = chat.subject
    messages: str = json.dumps(chat.messages)
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
                chat = ChatModel(
                    id=row[0],
                    subject=row[1],
                    messages=row[2]
                )
                chats.append(chat)
            return chats
    except Exception as e:
        print(str(e))
        raise Exception(f"Error getting chats: {str(e)}")
