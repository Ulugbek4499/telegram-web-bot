import React, { useState } from 'react';
import './ChatBox.css';

const ChatBox = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);
  const TELEGRAM_CHAT_ID = '8003145679'; // Your Telegram Chat ID
  const TELEGRAM_BOT_TOKEN = '7212413605:AAFMvGfgtilWWe9mzsrJ2Pbv35olXiVi6X0'; // Replace with your bot token

  const handleStartSpeaking = () => {
    const audio = new Audio('https://sanstv.ru/test/audio/test.mp3'); // Use the correct URL
    audio.play().catch(error => console.error('Error playing audio:', error)); // Handle any errors
    audio.onended = () => {
        setChatVisible(true); // Show chatbox after audio ends
    };
};


  const handleRecordStart = () => {
    setIsRecording(true);
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/mpeg' });
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

        // Update conversation
        setConversation((prev) => [...prev, { type: 'user', url: audioUrl }]);

        // Send audio to Telegram
        sendAudioToTelegram(audioBlob);

        // Play static response after recording
        const responseAudio = new Audio('https://sanstv.ru/test/audio/test.mp3');
        responseAudio.play();
        responseAudio.onended = () => {
          setConversation((prev) => [...prev, { type: 'bot', url: responseAudio.src }]);
        };
      };

      mediaRecorder.start();

      const stopRecording = () => {
        if (isRecording) {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      };

      document.addEventListener('mouseup', stopRecording, { once: true });
      setTimeout(stopRecording, 5000); // Auto stop after 5 seconds
    });
  };

  const sendAudioToTelegram = (audioBlob) => {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('audio', audioBlob, `recorded_audio_${Date.now()}.mp3`);

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAudio`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          console.log('Audio sent successfully to Telegram!');
        } else {
          console.error('Failed to send audio to Telegram:', data);
        }
      })
      .catch(error => console.error('Error sending audio to Telegram:', error));
  };

  return (
    <div className="chatbox-container">
      <button onClick={handleStartSpeaking}>Start Speaking</button>
      
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
            <button
              onMouseDown={handleRecordStart}
              disabled={isRecording}
            >
              {isRecording ? 'Recording...' : 'Hold to Speak'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
