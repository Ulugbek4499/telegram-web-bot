import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState(""); // State to store transcribed text
  const [enteredText, setEnteredText] = useState(""); // State to store user-entered text for TTS
  const [audioUrl, setAudioUrl] = useState(null); // State to store the audio URL for playing TTS response

  // Start recording user audio for Speech-to-Text
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
      setRecordedAudioBlob(audioBlob); // Save the recorded audio blob
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop(); // Stop recording after 5 seconds
    }, 5000);
  };

  // Send audio for Speech-to-Text
  const handleSendAudio = async () => {
    if (recordedAudioBlob) {
      const formData = new FormData();
      formData.append("audio", recordedAudioBlob, "audio.webm");

      const response = await fetch(
        "https://localhost:7035/api/speech/submit-audio",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setTranscribedText(data.transcribedText); // Set the transcribed text
    }
  };

  // Send entered text for Text-to-Speech
  const handleTextToSpeech = async () => {
    const response = await fetch(
      "https://localhost:7035/api/speech/text-to-speech",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: enteredText }),
      }
    );

    const blob = await response.blob(); // Receive audio as a blob
    const url = URL.createObjectURL(blob); // Create URL for the audio file
    setAudioUrl(url); // Set the URL to state to allow playback
  };

  return (
    <div className="container">
      <h1 className="heading">
        Speech App (Text-to-Speech and Speech-to-Text)
      </h1>

      {/* Speech-to-Text Section */}
      <h2>Speech-to-Text</h2>
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

      {/* Display the transcribed text */}
      {transcribedText && (
        <div className="transcribed-text">
          <h3>Transcribed Text:</h3>
          <p>{transcribedText}</p>
        </div>
      )}

      {/* Text-to-Speech Section */}
      <h2>Text-to-Speech</h2>
      <textarea
        className="text-input"
        placeholder="Enter text to convert to speech..."
        value={enteredText}
        onChange={(e) => setEnteredText(e.target.value)}
      />
      <button className="text-to-speech-btn" onClick={handleTextToSpeech}>
        Convert Text to Speech
      </button>

      {/* Play the generated speech audio */}
      {audioUrl && (
        <div className="audio-player">
          <h3>Generated Speech:</h3>
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

// import React, { useState } from "react";
// import "./App.css";

// const App = () => {
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
//   const [transcribedText, setTranscribedText] = useState(""); // State to store transcribed text

//   const handleStartRecording = async () => {
//     setIsSpeaking(true);

//     // Start recording audio
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const mediaRecorder = new MediaRecorder(stream);

//     const audioChunks = [];
//     mediaRecorder.ondataavailable = (event) => {
//       audioChunks.push(event.data);
//     };

//     mediaRecorder.onstop = async () => {
//       const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
//       setRecordedAudioBlob(audioBlob); // Save the recorded audio blob
//     };

//     mediaRecorder.start();

//     setTimeout(() => {
//       mediaRecorder.stop(); // Stop recording after 5 seconds
//     }, 5000);
//   };

//   const handleSendAudio = async () => {
//     if (recordedAudioBlob) {
//       const formData = new FormData();
//       formData.append("audio", recordedAudioBlob, "audio.webm");

//       // Send the audio blob to the backend for transcription
//       const response = await fetch(
//         "https://localhost:7035/api/speech/submit-audio",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const data = await response.json();
//       setTranscribedText(data.transcribedText); // Set the transcribed text to state to display it on the UI
//     }
//   };

//   return (
//     <div className="container">
//       <h1 className="heading">Simple Speech to Text App</h1>
//       {!isSpeaking && (
//         <button className="start-recording-btn" onClick={handleStartRecording}>
//           Start Recording
//         </button>
//       )}
//       {recordedAudioBlob && (
//         <button className="send-audio-btn" onClick={handleSendAudio}>
//           Send Audio
//         </button>
//       )}

//       {/* Display the transcribed text to users */}
//       {transcribedText && (
//         <div className="transcribed-text">
//           <h3>Transcribed Text:</h3>
//           <p>{transcribedText}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
