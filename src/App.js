import React, { useState, useContext } from "react";
import { Buffer } from "buffer";
import AppContext from "./context/AppContext";
import AppWrapper from "./AppWrapper";

Buffer.from("anything", "base64");
window.Buffer = window.Buffer || require("buffer").Buffer;

export const LoginContext = React.createContext({});

function App() {
  return (
    <div>
      <AppContext>
        <AppWrapper></AppWrapper>
      </AppContext>
    </div>
  );
}

export default App;
