PT_RAG = """
Based only on the provided context, please answer the question.
Do not use any knowledge outside of the context. 

Context:
{context}

Question:
{question}
"""

PT_MAP_GENERAL = """
Summarize the following documents.

Documents:

{docs}
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

PT_REDUCE_GENERAL = """
Provide a concise summary of the following documents.

Documents:

{docs}
"""

PT_REDUCE_THEMES = """
Generate brief taglines that describe the best and worst parts of the following documents.

Documents:

{docs}
"""

PT_REDUCE_THEMES_CONCISE = """
Distill the following documents into a single, concise statement that captures the tone of the feedback on the event.

Documents:

{docs}
"""

PT_REDUCE_SENTIMENT = """
Provide a concise summary of the following documents that highlights common praise or criticism.

Documents:

{docs}
"""

PT_PRESETS = {
    'GENERAL': (PT_MAP_GENERAL, PT_REDUCE_GENERAL),
    'THEMES_GENERAL': (PT_MAP_GENERAL, PT_REDUCE_THEMES),
    'SENTIMENT_GENERAL': (PT_MAP_GENERAL, PT_REDUCE_SENTIMENT),

    'THEMES_INTERVIEWS_1': (PT_MAP_EVENT_INTERVIEWS_GENERAL, PT_REDUCE_THEMES),
    'THEMES_INTERVIEWS_HIGHLIGHTS_1': (PT_MAP_EVENT_INTERVIEWS_GENERAL, PT_REDUCE_THEMES_CONCISE)
}
