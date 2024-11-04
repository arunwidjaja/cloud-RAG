PT_RAG = """
Based only on the provided context, please answer the question.
Do not use any knowledge outside of the context. 

Context:
{context}

Question:
{question}
"""
PT_MAP_EVENT_INTERVIEWS_GENERAL = """
The following documents are segments of interviews with attendees at an event.
Summarize them.

Documents:

{docs}
"""

PT_MAP_EVENT_INTERVIEWS_SENTIMENT = """
The following documents are segments of interviews with attendees at an event.
Summarize them with a focus on what the attendees liked and disliked.

Documents:

{docs}
"""

PT_MAP_EVENT_INTERVIEWS_SENTIMENT_NEGATIVE = """
The following documents are segments of interviews with attendees at an event.
Summarize them with a focus on what they liked.

Documents:

{docs}
"""

PT_MAP_EVENT_INTERVIEWS_SENTIMENT_POSITIVE = """
The following documents are segments of interviews with attendees at an event.
Summarize them with a focus on what they disliked.

Documents:

{docs}
"""

PT_REDUCE_THEMES = """
Provide a concise summary of the following documents that highlights some key themes.

Documents:

{docs}
"""

PT_REDUCE_SENTIMENT = """
Provide a concise summary of the following documents that highlights common praise or criticism.

Documents:

{docs}
"""
