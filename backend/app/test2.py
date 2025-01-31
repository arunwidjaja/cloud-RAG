import datetime


def get_time():
    timestamp = int(datetime.datetime.now(
        tz=datetime.timezone.utc).timestamp())
    print(timestamp)


get_time()
