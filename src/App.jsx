import { useCallback, useEffect, useState } from "react";
import "./App.css";
import ChatBox from "./components/chatbox/ChatBox";

const telegram = window.Telegram.WebApp;

const App = () => {
  return (
    <>
      <h1 className="heading">Tarteeb Speech</h1>
      <ChatBox />
    </>
  );
};

export default App;
