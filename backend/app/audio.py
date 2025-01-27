# External Modules
import openai

# Local Modules
import config

openai.api_key = config.OPENAI_API_KEY


async def audio_to_text() -> str:
    return "Audio Parsed!"


def transcribe_audio(audio_bytes: bytes):
    """
    Convert speech to text using OpenAI's Whisper model
    """
    try:
        transcript = openai.audio.transcriptions.create(
            model="whisper-1",
            file=("recording.wav", audio_bytes)
        )
        return transcript.text
    except Exception as e:
        print(f"Error during transcription: {e}")
        return None


# Example usage
if __name__ == "__main__":
    print("Running audio.py main function")
    # Speech to Text example
    # audio_file_path = r"C:\Users\Arun Widjaja\Documents\_MY_DOCS\projects\studyfetch\backend\app\data_uploads\87924606b4131a8a\recording.wav"
    # transcript = transcribe_audio(audio_file_path)
    # if transcript:
    #     print("Transcription:")
    #     print(transcript)

    # # Text to Speech example
    # text = "This is a test of OpenAI's text to speech library."
    # output_path = "output_speech.mp3"
    # success = text_to_speech(text, output_path)
    # if success:
    #     print(f"Audio saved to {output_path}")
