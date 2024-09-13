import json
import os

# Read in the .md file and process it line by line
# Every odd line (starting at line 1) is a question
# Every even line (starting at line 2) is the answer


def generate_json_from_markdown(markdown_file):
    base_name = os.path.splitext(markdown_file)[0]
    json_output_file = base_name + '.json'
    test_cases = []

    with open(markdown_file, 'r') as file:
        lines = file.readlines()

    # Loop through the lines with a step of 2 (question, answer)
    i = 0
    while i < len(lines):
        # Strip to remove any surrounding whitespace or newlines
        test_question = lines[i].strip()
        test_answer = lines[i + 1].strip()

        # Create a dictionary for each test case
        test_cases.append({
            "testQuestion": test_question,
            "testAnswer": test_answer
        })

        # Move to the next question
        i += 2

    # Write the test cases to the json file
    with open(json_output_file, 'w') as json_file:
        json.dump({"testCases": test_cases}, json_file, indent=4)

    # returns the file name, not the file itself
    return json_output_file
