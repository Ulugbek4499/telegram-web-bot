import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null); // For storing the GPT response speech audio URL

  // Start recording user audio for Speech-to-Text and ChatGPT Response
  const handleStartRecording = async () => {
    setIsSpeaking(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    const audioChunks = [];
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

      // Send the recorded audio to the backend and get the response as speech
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      const response = await fetch(
        "https://localhost:7035/api/speech/submit-audio",
        {
          method: "POST",
          body: formData,
        }
      );

      const blob = await response.blob(); // Receive audio as a blob
      const url = URL.createObjectURL(blob); // Create URL for the audio file
      setAudioUrl(url); // Set the URL to state to allow playback
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop(); // Stop recording after 5 seconds
    }, 5000);
  };

  return (
    <div className="container">
      <h1 className="heading">Tarteeb Speech</h1>

      {/* Recording and processing */}
      {!isSpeaking && (
        <button className="start-recording-btn" onClick={handleStartRecording}>
          Start Speaking
        </button>
      )}

      {/* Play the generated speech response */}
      {audioUrl && (
        <div className="audio-player">
          <h3>GPT Response:</h3>
          <audio controls>
            <source src={audioUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default App;
