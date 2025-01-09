# External Modules


# Local Modules
from paths import set_env_paths


def init_paths(user_id: str) -> None:
    """
    Initializes necessary directories
    """
    set_env_paths(user_id)


def main():
    return


if __name__ == "__main__":
    main()
