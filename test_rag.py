from query_data import query_rag
from langchain_community.llms.ollama import Ollama

from langchain_openai import ChatOpenAI

EVAL_PROMPT = """
Query: {query}
Expected Response: {expected_response}
Actual Response: {actual_response}
---
(Answer with 'true' or 'false') Does the actual response match the expected response? 
"""
# def main():
#     print("placeholder")

# if __name__ == "__main__":
#     main()

def run_tests():
    print("Testing RAG responses:")
    test_pachinko_1()
    test_pachinko_2()
    test_alice_1()
    
def test_pachinko_1():
    query_and_validate(
        question="In what city did Koh Hansu live?",
        expected_response="Koh Hansu lived in Osaka",
    )

def test_pachinko_2():
    query_and_validate(
        question="For how much money did Sunja sell her watch? Please answer with only the amount and the currency.",
        expected_response="200 yen",
    )

def test_alice_1():
    query_and_validate(
        question="What did Alice hand out as prizes?",
        expected_response="A box of comfits",
    )

def query_and_validate(question: str, expected_response: str):
    response_text = query_rag(question, mute = True).content
    prompt = EVAL_PROMPT.format(
        query = question,
        expected_response=expected_response,
        actual_response=response_text
    )

    # Choose model
    # model = Ollama(model="mistral")
    model = ChatOpenAI()

    evaluation_results_str = model.invoke(prompt)
    evaluation_results_str_cleaned = evaluation_results_str.content.strip().lower()

    print(prompt)

    if "true" in evaluation_results_str_cleaned:
        # Print response in Green if it is correct.
        print("\033[92m" + f"Response: {evaluation_results_str_cleaned}" + "\033[0m")
        return True
    elif "false" in evaluation_results_str_cleaned:
        # Print response in Red if it is incorrect.
        print("\033[91m" + f"Response: {evaluation_results_str_cleaned}" + "\033[0m")
        return False
    else:
        raise ValueError(
            f"Invalid evaluation result. Cannot determine if 'true' or 'false'."
        )