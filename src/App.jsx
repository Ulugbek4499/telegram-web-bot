import React, { useState, useRef } from "react";
import "./App.css";

const App = () => {
  const [currentStep, setCurrentStep] = useState("start");
  const [questionAudioUrl, setQuestionAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  //const [audioRef] = useState(useRef(null));
  const audioRef = useRef(null);

  // Handle "Start Speaking" button click
  const handleStartSpeaking = async () => {
    setCurrentStep("playingQuestion");

    // Fetch the question audio from backend
    const response = await fetch(
      "https://localhost:7035/api/speech/get-question",
      {
        method: "GET",
      }
    );

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setQuestionAudioUrl(url);

    // Play the question audio
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();

      // After audio finishes, move to next step
      audioRef.current.onended = () => {
        setCurrentStep("waitingToAnswer");
      };
    }
  };

  // Handle "Start Answering" button click
  const handleStartAnswering = async () => {
    setCurrentStep("recordingAnswer");
    setRecordedChunks([]);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.start();
    setIsRecording(true);

    recorder.onstop = () => {
      setRecordedChunks(chunks);
    };
  };

  // Handle "Pause" button click
  const handlePauseRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.pause();
      setIsRecording(false);
      setCurrentStep("paused");
    }
  };

  // Handle "Continue" button click
  const handleResumeRecording = () => {
    if (mediaRecorder && !isRecording) {
      mediaRecorder.resume();
      setIsRecording(true);
      setCurrentStep("recordingAnswer");
    }
  };

  // Handle "Delete" button click
  const handleDeleteRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    setRecordedChunks([]);
    setIsRecording(false);
    setCurrentStep("waitingToAnswer");
  };

  // Handle "Send" button click
  const handleSendRecording = () => {
    if (mediaRecorder) {
      setIsRecording(false);
      setCurrentStep("sending");

      mediaRecorder.onstop = async () => {
        // Combine recorded chunks into a blob
        const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });

        // Send the recorded audio to the backend and get the next question
        const formData = new FormData();
        formData.append("audio", audioBlob, "answer.webm");

        const response = await fetch(
          "https://localhost:7035/api/speech/submit-answer",
          {
            method: "POST",
            body: formData,
          }
        );

        // Handle the response
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setQuestionAudioUrl(url);

        // Play the next question
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();

          audioRef.current.onended = () => {
            setCurrentStep("waitingToAnswer");
          };
        }
      };

      mediaRecorder.stop();
    }
  };

  // Handle "End Speaking" button click
  const handleEndSpeaking = () => {
    // Reset the app to initial state
    setCurrentStep("start");
    setQuestionAudioUrl(null);
    setRecordedChunks([]);
    setIsRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  return (
    <div className="container">
      <h1 className="heading">Tarteeb Speech</h1>

      {currentStep === "start" && (
        <button className="start-speaking-btn" onClick={handleStartSpeaking}>
          Start Speaking
        </button>
      )}

      {currentStep === "playingQuestion" && (
        <div>
          <p>Playing question...</p>
          <audio ref={audioRef} />
        </div>
      )}

      {currentStep === "waitingToAnswer" && (
        <div>
          <button
            className="start-answering-btn"
            onClick={handleStartAnswering}
          >
            Start Answering
          </button>
          <button className="end-speaking-btn" onClick={handleEndSpeaking}>
            End Speaking
          </button>
        </div>
      )}

      {(currentStep === "recordingAnswer" || currentStep === "paused") && (
        <div>
          {currentStep === "recordingAnswer" && <p>Recording...</p>}
          {currentStep === "paused" && <p>Paused</p>}
          <button
            onClick={isRecording ? handlePauseRecording : handleResumeRecording}
          >
            {isRecording ? "Pause" : "Continue"}
          </button>
          <button onClick={handleDeleteRecording}>Delete</button>
          <button onClick={handleSendRecording}>Send</button>
        </div>
      )}

      {currentStep === "sending" && <p>Processing your answer...</p>}
    </div>
  );
};

export default App;

// import React, { useState } from "react";
// import "./App.css";

// const App = () => {
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [audioUrl, setAudioUrl] = useState(null); // For storing the GPT response speech audio URL

//   // Start recording user audio for Speech-to-Text and ChatGPT Response
//   const handleStartRecording = async () => {
//     setIsSpeaking(true);

//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const mediaRecorder = new MediaRecorder(stream);

//     const audioChunks = [];
//     mediaRecorder.ondataavailable = (event) => {
//       audioChunks.push(event.data);
//     };

//     mediaRecorder.onstop = async () => {
//       const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

//       // Send the recorded audio to the backend and get the response as speech
//       const formData = new FormData();
//       formData.append("audio", audioBlob, "audio.webm");

//       const response = await fetch(
//         "https://localhost:7035/api/speech/submit-audio",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const blob = await response.blob(); // Receive audio as a blob
//       const url = URL.createObjectURL(blob); // Create URL for the audio file
//       setAudioUrl(url); // Set the URL to state to allow playback
//     };

//     mediaRecorder.start();
//     setTimeout(() => {
//       mediaRecorder.stop(); // Stop recording after 5 seconds
//     }, 5000);
//   };

//   return (
//     <div className="container">
//       <h1 className="heading">Tarteeb Speech</h1>

//       {/* Recording and processing */}
//       {!isSpeaking && (
//         <button className="start-recording-btn" onClick={handleStartRecording}>
//           Start Speaking
//         </button>
//       )}

//       {/* Play the generated speech response */}
//       {audioUrl && (
//         <div className="audio-player">
//           <h3>GPT Response:</h3>
//           <audio controls>
//             <source src={audioUrl} type="audio/mp3" />
//             Your browser does not support the audio element.
//           </audio>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
