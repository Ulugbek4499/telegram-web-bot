import React, { useState, useRef } from "react";
import "./ChatBox.css";

const ChatBox = ({ onEndSpeaking }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Start recording user voice
  const handleStartRecording = () => {
    setIsRecording(true);
    setIsListening(false);
    setRecordedAudioBlob(null); // Reset recorded audio blob for a fresh recording

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = []; // Clear any previous audio chunks

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data); // Save the audio data chunks
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setRecordedAudioBlob(audioBlob); // Set the recorded audio blob
      };

      mediaRecorder.start(); // Start recording
    });
  };

  // Stop recording and create audio blob
  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsWaiting(true);

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // Stop the recording
    }
  };

  // Send audio blob to backend
  const handleSendAudio = async () => {
    if (recordedAudioBlob) {
      const formData = new FormData();
      formData.append("UserId", "123"); // Example user ID
      formData.append("FileName", `recorded_audio_${Date.now()}.webm`); // Unique file name with timestamp
      formData.append("AudioFile", recordedAudioBlob); // Send recorded audio blob

      // Send the audio file to the backend
      const response = await fetch(
        "https://localhost:7035/api/speech/submit-audio",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.text();
      console.log(data); // This will be replaced by playing the next audio question later

      setIsWaiting(false); // Stop waiting once the response is received

      // Reset the audio blob and chunks for the next recording
      setRecordedAudioBlob(null);
      audioChunksRef.current = [];
    }
  };

  const handleEndSpeaking = () => {
    setIsRecording(false);
    setIsListening(false);
    setIsWaiting(false);
    onEndSpeaking();
  };

  return (
    <div className="chatbox-container">
      {isListening && (
        <>
          <div className="moving-shape"></div>
          <p>Website is speaking...</p>
        </>
      )}

      {!isRecording && !isListening && !isWaiting && (
        <button className="record-btn" onClick={handleStartRecording}>
          Start Recording
        </button>
      )}

      {isRecording && (
        <>
          <div className="listening-shape"></div>
          <button className="stop-btn" onClick={handleStopRecording}>
            Stop Recording
          </button>
        </>
      )}

      {isWaiting && (
        <>
          <div className="waiting-shape"></div>
          <p>Waiting for the next question...</p>
        </>
      )}

      {recordedAudioBlob && (
        <button className="send-audio-btn" onClick={handleSendAudio}>
          Send Audio
        </button>
      )}

      <button className="end-btn" onClick={handleEndSpeaking}>
        End Speaking
      </button>
    </div>
  );
};

export default ChatBox;
