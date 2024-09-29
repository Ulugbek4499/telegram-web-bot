import { useState } from "react";
import "./App.css";
import ChatBox from "./components/chatbox/ChatBox";

const App = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleStartSpeaking = () => {
    setIsSpeaking(true);
    // Call backend to fetch voice question
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
