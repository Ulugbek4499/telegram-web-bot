import './ChatBox.css';
import React, { useState } from 'react';

const ChatBox = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [messages, setMessages] = useState([]); // To hold chat conversation

    const handleStartSpeaking = () => {
        const audio = new Audio('/audio/IntroAudio.mp3'); // Replace with correct path to intro audio
        audio.play();

        // Once the intro audio ends, show the chatbox
        audio.onended = () => {
            document.querySelector('.chatbox').style.display = 'block';
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
                
                // Add the user's recorded message to chatbox
                setMessages(prevMessages => [...prevMessages, { sender: 'user', audio: audioUrl }]);

                // Play the next static response audio after the user records
                const nextAudio = new Audio('/audio/what-is-next.mp3'); // Replace with the correct path to "What is next" audio
                nextAudio.play();

                // Add website response after next audio ends
                nextAudio.onended = () => {
                    setMessages(prevMessages => [...prevMessages, { sender: 'website', audio: '/audio/what-is-next.mp3' }]);
                };

                saveAudioLocally(audioBlob); // Save the recorded audio
            };

            mediaRecorder.start();
            window.mediaRecorder = mediaRecorder; // Store the recorder globally to stop it later
        });
    };

    const handleRecordStop = () => {
        if (window.mediaRecorder) {
            window.mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    // Function to save audio locally (simulate saving to "D" drive)
    const saveAudioLocally = (audioBlob) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(audioBlob);
        fileReader.onloadend = () => {
            const arrayBuffer = fileReader.result;
            const filePath = "D:\\TarteebSpeechTest\\user-recorded-audio.mp3"; // Static file path, update as necessary
            
            // Simulate Node.js file system (fs) functionality for saving locally
            const fs = window.require('fs'); // Assuming Electron or similar environment
            
            fs.writeFile(filePath, Buffer.from(new Uint8Array(arrayBuffer)), (err) => {
                if (err) {
                    console.error('Error saving the audio file:', err);
                } else {
                    console.log('Audio saved successfully at', filePath);
                }
            });
        };
    };

    return (
        <div className="chatbox-container">
            <button onClick={handleStartSpeaking}>Start Speaking</button>

            <div className="chatbox">
                <div className="messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender}`}>
                            <audio src={message.audio} controls />
                        </div>
                    ))}
                </div>

                <button 
                    onMouseDown={handleRecordStart} 
                    onMouseUp={handleRecordStop} 
                    disabled={isRecording}
                >
                    {isRecording ? 'Recording...' : 'Hold to Speak'}
                </button>

                {audioURL && <audio src={audioURL} controls />}
            </div>
        </div>
    );
};

export default ChatBox;
