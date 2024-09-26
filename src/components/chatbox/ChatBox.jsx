import './ChatBox.css';import React, { useState } from 'react';

const ChatBox = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    
    const handleStartSpeaking = () => {
        const audio = new Audio( "D:\\TarteebSpeechTest\\AudiAuto\\IntroAudio.mp3"); // Update this path with your actual audio file path
        audio.play();
    };
  
    const handleRecord = () => {
        setIsRecording(true);
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/mpeg' }); // Set mimeType to MP3
            const audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' }); // Change the blob type to MP3
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioURL(audioUrl);
                
                // Save to local storage
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(audioBlob);
                fileReader.onloadend = () => {
                    const arrayBuffer = fileReader.result;
                    const filePath = "D:\\TarteebSpeechTest"; // Path to save the file locally
                    
            // Node.js File System (fs) to save the file
            const fs = window.require('fs'); // Assuming you are using an Electron or similar environment
  
            fs.writeFile(filePath, Buffer.from(new Uint8Array(arrayBuffer)), (err) => {
              if (err) {
                console.error('Error saving the audio file:', err);
              } else {
                console.log('Audio saved successfully at', filePath);
              }
            });
          };
        };
  
        mediaRecorder.start();
  
        setTimeout(() => {
          mediaRecorder.stop();
          setIsRecording(false);
        }, 5000); // Record for 5 seconds
      });
    };
  
    return (
      <div className="chatbox">
        <button onClick={handleStartSpeaking}>Start Speaking</button>
        <button 
          onMouseDown={handleRecord} 
          disabled={isRecording}
        >
          {isRecording ? 'Recording...' : 'Hold to Speak'}
        </button>
        {audioURL && <audio src={audioURL} controls />}
      </div>
    );
  };
  
  export default ChatBox;