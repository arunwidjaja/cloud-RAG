import argparse


def addn():
    # Argument parsing inside the function
    parser = argparse.ArgumentParser(
        description="Add two numbers from the command line.")

    # Add arguments
    parser.add_argument('a', type=int, help='First number')
    parser.add_argument('b', type=int, help='Second number')

    # Parse arguments
    args = parser.parse_args()

    # Perform the addition
    result = args.a + args.b

    # Print the result
    print(f"The sum of {args.a} and {args.b} is {result}.")
