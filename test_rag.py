from query_data import query_rag
from langchain_community.llms.ollama import Ollama

from langchain_openai import ChatOpenAI

import json
from jsonMakerUtility import generate_json_from_markdown

EVAL_PROMPT = """
Query: {query}
Expected Response: {expected_response}
Actual Response: {actual_response}
---
(Answer with 'true' or 'false') Does the actual response match the expected response?
"""
TEST_CASES_FILE_NAME = "testCases.md"


def main():
    run_tests()


def run_tests():
    # Load the test questions and answers
    # The input file is .md for human readability and ease of editing. It's converted to JSON and written to disk first.
    print("Loading evaluation questions and answers...")
    testCasesJSON = generate_json_from_markdown(TEST_CASES_FILE_NAME)
    with open(testCasesJSON, 'r') as file:
        data = json.load(file)

    print("Testing RAG responses:")
    # Iterate through each test case and print the testQuestion and testAnswer
    for i, testCase in enumerate(data['testCases']):
        query_and_validate(
            question=f"{testCase['testQuestion']}",
            expected_response=f"{testCase['testAnswer']}"
        )


def query_and_validate(question: str, expected_response: str):
    response_text = query_rag(question, mute=True).content
    prompt = EVAL_PROMPT.format(
        query=question,
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
        print("\033[92m" +
              f"Response: {evaluation_results_str_cleaned}" + "\033[0m")
        return True
    elif "false" in evaluation_results_str_cleaned:
        # Print response in Red if it is incorrect.
        print("\033[91m" +
              f"Response: {evaluation_results_str_cleaned}" + "\033[0m")
        return False
    else:
        raise ValueError(
            f"Invalid evaluation result. Cannot determine if 'true' or 'false'."
        )


if __name__ == "__main__":
    main()
