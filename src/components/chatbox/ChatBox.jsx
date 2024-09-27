import React, { useState } from 'react';
import './ChatBox.css';

const ChatBox = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const TELEGRAM_CHAT_ID = '8003145679';
  const TELEGRAM_BOT_TOKEN = '7212413605:AAFMvGfgtilWWe9mzsrJ2Pbv35olXiVi6X0'; // Replace with your bot token

  const handleStartSpeaking = () => {
    const audio = new Audio('https://sanstv.ru/test/audio/test.mp3');
    audio.play().catch(error => console.error('Error playing audio:', error));
    audio.onended = () => {
      setChatVisible(true);
    };
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      setMediaRecorder(recorder);
      setAudioChunks([]); // Clear previous chunks
      recorder.ondataavailable = (event) => {
        setAudioChunks((prevChunks) => [...prevChunks, event.data]);
      };
      recorder.start();
      setIsRecording(true);
      setIsPaused(false);
    }).catch(error => console.error('Error accessing media devices:', error));
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };

  const continueRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };

  const deleteRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setAudioChunks([]); // Clear the recorded chunks
      setAudioURL(null);
    }
  };

  const sendAudioToTelegram = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    setAudioURL(audioUrl);

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('audio', audioBlob, `recorded_audio_${Date.now()}.webm`);

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAudio`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          console.log('Audio sent successfully to Telegram!');
          // Update conversation with sent audio
          setConversation((prev) => [...prev, { type: 'user', url: audioUrl }]);
          setAudioChunks([]); // Clear chunks after sending
          setAudioURL(null);
        } else {
          console.error('Failed to send audio to Telegram:', data);
        }
      })
      .catch(error => console.error('Error sending audio to Telegram:', error));
  };

  return (
    <div className="chatbox-container">
      <button className="start-speaking-button" onClick={handleStartSpeaking}>
        Start Speaking
      </button>

      {chatVisible && (
        <div className="chatbox">
          <div className="chatbox-header">Chat with us!</div>
          <div className="chatbox-body">
            {conversation.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <audio src={message.url} controls />
              </div>
            ))}
          </div>
          <div className="chatbox-footer">
            {!isRecording && !audioURL && (
              <button className="chatbox-button" onClick={startRecording}>
                Start Recording
              </button>
            )}
            {isRecording && !isPaused && (
              <>
                <button className="chatbox-button" onClick={pauseRecording}>
                  Pause
                </button>
                <button className="chatbox-button" onClick={sendAudioToTelegram}>
                  Send
                </button>
                <button className="chatbox-button" onClick={deleteRecording}>
                  Delete
                </button>
              </>
            )}
            {isRecording && isPaused && (
              <>
                <button className="chatbox-button" onClick={continueRecording}>
                  Continue
                </button>
                <button className="chatbox-button" onClick={sendAudioToTelegram}>
                  Send
                </button>
                <button className="chatbox-button" onClick={deleteRecording}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;