import { useState } from "react";
import "./App.css";
import ChatBox from "./components/chatbox/ChatBox";

const App = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // const handleStartSpeaking = () => {
  //   setIsSpeaking(true);
  //   // Call backend to fetch voice question
  // };
  const handleStartSpeaking = async () => {
    setIsSpeaking(true);

    // Call the backend to start the session
    const response = await fetch(
      "https://localhost:7035/api/Speech/start-session"
    );
    const data = await response.text();

    // Display the received question (for testing purposes)
    console.log(data); // You should replace this with playing the audio question later
  };

  const handleEndSpeaking = () => {
    setIsSpeaking(false);
    // Notify backend to finish session and send feedback via Telegram
  };

  return (
    <div className="container">
      <h1 className="heading">Tarteeb Speech</h1>
      {!isSpeaking && (
        <button className="start-speaking-btn" onClick={handleStartSpeaking}>
          Start Speaking
        </button>
      )}
      {isSpeaking && <ChatBox onEndSpeaking={handleEndSpeaking} />}
    </div>
  );
};

export default App;
