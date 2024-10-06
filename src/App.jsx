import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState(""); // State to store transcribed text

  const handleStartRecording = async () => {
    setIsSpeaking(true);

    // Start recording audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    const audioChunks = [];
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      setRecordedAudioBlob(audioBlob); // Save the recorded audio blob
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop(); // Stop recording after 5 seconds
    }, 5000);
  };

  const handleSendAudio = async () => {
    if (recordedAudioBlob) {
      const formData = new FormData();
      formData.append("audio", recordedAudioBlob, "audio.webm");

      // Send the audio blob to the backend for transcription
      const response = await fetch(
        "https://localhost:7035/api/speech/submit-audio",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setTranscribedText(data.transcribedText); // Set the transcribed text to state to display it on the UI
    }
  };

  return (
    <div className="container">
      <h1 className="heading">Simple Speech to Text App</h1>
      {!isSpeaking && (
        <button className="start-recording-btn" onClick={handleStartRecording}>
          Start Recording
        </button>
      )}
      {recordedAudioBlob && (
        <button className="send-audio-btn" onClick={handleSendAudio}>
          Send Audio
        </button>
      )}

      {/* Display the transcribed text to users */}
      {transcribedText && (
        <div className="transcribed-text">
          <h3>Transcribed Text:</h3>
          <p>{transcribedText}</p>
        </div>
      )}
    </div>
  );
};

export default App;
