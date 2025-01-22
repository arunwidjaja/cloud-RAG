# External Modules
from pathlib import Path
import openai

# Local Modules
from paths import get_paths

import config

openai.api_key = config.OPENAI_API_KEY


async def audio_to_text() -> str:
    return "Audio Parsed!"


def transcribe_audio(audio_path: Path):
    """
    Convert speech to text using OpenAI's Whisper model
    """
    try:
        with open(audio_path, 'rb') as audio_file:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        return transcript.text
    except Exception as e:
        print(f"Error during transcription: {e}")
        return None


def text_to_speech(text: str, output_path: Path, voice="alloy"):
    """
    Convert text to speech using OpenAI's TTS
    Available voices: alloy, echo, fable, onyx, nova, shimmer
    """
    try:
        response = openai.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text
        )

        # Save the audio file
        with open(output_path, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"Error during speech synthesis: {e}")
        return False


# Example usage
if __name__ == "__main__":
    # Speech to Text example
    audio_file_path = r"C:\Users\Arun Widjaja\Documents\_MY_DOCS\projects\studyfetch\backend\app\data_uploads\87924606b4131a8a\recording.wav"
    transcript = transcribe_audio(audio_file_path)
    if transcript:
        print("Transcription:")
        print(transcript)

    # Text to Speech example
    text = "This is a test of OpenAI's text to speech library."
    output_path = "output_speech.mp3"
    success = text_to_speech(text, output_path)
    if success:
        print(f"Audio saved to {output_path}")
