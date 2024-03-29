import React, { createContext, useReducer } from "react";
import appReducer from "../reducer/AppReducer";

const AppStateContext = React.createContext(null);

const DispatcherContext = React.createContext(null);

export default function AppContext({ children }) {
  const [state, dispatcher] = useReducer(appReducer, {
    userInfo: { loggedInUser: {}, recentChatUsers: [] },
    rsocketClient: {},
    chatState: {},
  });

  return (
    <DispatcherContext.Provider value={dispatcher}>
      <AppStateContext.Provider value={state}>
        {children}
      </AppStateContext.Provider>
    </DispatcherContext.Provider>
  );
}

export { AppStateContext, DispatcherContext };
