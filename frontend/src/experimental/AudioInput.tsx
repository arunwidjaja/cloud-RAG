import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Here you can handle the recorded audio
        // For example, you could:
        // 1. Send it to a server
        // 2. Play it back
        // 3. Download it
        console.log('Recording finished, audio URL:', audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Error accessing microphone: ' + (err as Error).message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <button
        onClick={toggleRecording}
        className={`rounded-full transition-colors focus:outline-none${
          isRecording 
            ? 'bg-highlight text-text hover:bg-warning hover:text-text2' 
            : 'bg-none text-text hover:bg-highlight hover:text-text2'
        }`}
      >
        {isRecording ? (
          <Square className="w-10 h-10 p-2" />
        ) : (
          <Mic className="w-10 h-10 p-1" />
        )}
      </button>
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
};

export default AudioRecorder;