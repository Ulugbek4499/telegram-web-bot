import React, { useState } from "react";
import "./ChatBox.css";

const ChatBox = ({ onEndSpeaking }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsListening(false);
    // Record user voice
  };

  // const handleStopRecording = () => {
  //   setIsRecording(false);
  //   setIsWaiting(true);
  //   // Send voice to backend and wait for response
  // };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsWaiting(true);

    // Create form data to send the audio file
    const formData = new FormData();
    formData.append("UserId", "123"); // Example user ID
    formData.append("FileName", "recorded_audio.webm"); // Example file name
    formData.append("AudioFile", recordedAudioBlob); // Your recorded audio blob

    // Send the audio file to the backend
    const response = await fetch(
      "https://localhost:7035/api/Speech/submit-audio",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.text();
    console.log(data); // This will be replaced by playing the next audio question later
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

      <button className="end-btn" onClick={handleEndSpeaking}>
        End Speaking
      </button>
    </div>
  );
};

export default ChatBox;
