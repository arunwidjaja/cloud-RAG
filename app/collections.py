# External Modules
from typing import List

# Local Modules
import config
import re


def format_name(collections: List[str], uuid: str) -> List[str]:
    """
    Formats a list of collection names by adding a UUID to it.

    Args:
        collections: The list of collection names to format.
        uuid: The UUID to format collections with.

    Returns:
        Returns the formatted list.

    Example:
        format_name("test") --> "u__1234567812345678_test"
    """
    formatted_collections: List[str] = []
    for col in collections:
        col_f = f"u__{uuid}_{col}"
        formatted_collections.append(col_f)
    return formatted_collections


def unformat_name(collections: List[str]) -> List[str]:
    """
    Unformats a list of collection names by removing the UUID from it.

    Args:
        collections: The list of collection names to unformat.

    Returns:
        The unformatted list.

    Example:
        unformat_name("u__1234567812345678_test") --> "test"
    """
    uuid_length = config.UUID_LENGTH
    pattern = f"^u__[0-9a-f]{uuid_length}_"
    unformatted_collections: List[str] = []
    for col in collections:
        col_uf = re.sub(pattern, '', col, flags=re.IGNORECASE)
        unformatted_collections.append(col_uf)
    return unformatted_collections


def filter_collections(collections: List[str], uuid: str) -> List[str]:
    """
    Filters a list of collection names.

    Args:
        collections: The list of collections to filter.
        uuid: The UUID to filter for.

    Returns:
        The collections belonging to the specified UUID.
    """
    pattern = f"^u__{uuid}_"
    matches: List[str] = []
    for col in collections:
        if re.match(pattern, col):
            matches.append(col)
    return matches
