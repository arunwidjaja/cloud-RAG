import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface AudioRecorderProps {
  onRecord: (recording: FormData) => void;
}

export const AudioRecorder = ({ onRecord }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);



  async function startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const formData = new FormData();

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        formData.append('audio', audioBlob, 'recording.wav');
        onRecord(formData)
        // const audioUrl = URL.createObjectURL(audioBlob);
        // const audio = new Audio(audioUrl);
        // audio.play();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Error accessing microphone: ' + (err as Error).message);
    }
  };

  function stopRecording(): void {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  function toggleRecording(): void {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div
      className={`
        shrink-0
        m-1 rounded-full
        text-text opacity-50
        transition-colors
        hover:cursor-pointer
        hover:opacity-100
        focus:outline-none focus-visible:outline-none focus:ring-0
      `}>
      <button
        onClick={toggleRecording}
        className={`
          focus:outline-none focus-visible:outline-none focus:ring-0
          ${isRecording
            ? 'text-text hover:text-warning'
            : 'text-text'
          }
        `}>
        {isRecording ? (
          <Square />
        ) : (
          <Mic />
        )}
      </button>
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
};

export default AudioRecorder;