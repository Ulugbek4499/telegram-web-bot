import React, { useState } from 'react';
import './ChatBox.css';

const ChatBox = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
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
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/mpeg' });
      setMediaRecorder(recorder);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

        // Update conversation with recorded audio
        setConversation((prev) => [...prev, { type: 'user', url: audioUrl }]);

        // Optionally send audio to Telegram
        sendAudioToTelegram(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    });
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
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

  const handleSendAudio = () => {
    if (audioURL) {
      sendAudioToTelegram(audioURL);
      // Reset audio URL after sending
      setAudioURL(null);
    }
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
            {!isRecording ? (
              <button onClick={startRecording}>Start Recording</button>
            ) : (
              <button onClick={stopRecording}>Stop Recording</button>
            )}
            {audioURL && (
              <button onClick={handleSendAudio}>Send Audio</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
