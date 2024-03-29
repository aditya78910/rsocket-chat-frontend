import Login from "./components/Login/Login";
import ChatBox from "./components/ChatBox/ChatBox";
import { AppStateContext } from "./context/AppContext";
import { useContext } from "react";

export default function AppWrapper() {
  const { userInfo, rsocketClient, chatState } = useContext(AppStateContext);

  return (
    <div>
      {!userInfo.loggedInUser.username && <Login />}
      {userInfo.loggedInUser.username && <ChatBox />}
    </div>
  );
}
