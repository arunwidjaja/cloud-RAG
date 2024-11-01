PROMPT_TEMPLATE = """
Based only on the provided context, please answer the question.
Do not use any knowledge outside of the context. 

Context:
{context}

Question:
{question}
"""

PROMPT_TEMPLATE_SENTIMENT = """
Summarize the overall customer sentiment towards the product based on the given context.
Emphasize themes of satisfaction or dissatisfaction where possible.
"""


PROMPT_TEMPLATE_THEMATIC = """
Based on the following customer feedback, identify the main themes. 
Group the themes under categories such as "Positive Features," "Areas for Improvement," and "Overall Satisfaction."

Feedback:
{context}

Please list the identified themes along with a brief explanation.
"""
