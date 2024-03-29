import { useState, useContext, useReducer, useRef, useEffect } from "react";
import axios from "axios";
import "./Login.css";
import { getRsocketClient } from "../../client/ChatClient";
import { AppStateContext, DispatcherContext } from "../../context/AppContext";
import Signup from "./Signup";
import { get_base_api_url } from "../../util/util";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { userInfo, rsocketClient, chatState } = useContext(AppStateContext);
  const useInfoRef = useRef(userInfo);
  const dispatch = useContext(DispatcherContext);

  useEffect(() => {
    console.log("LOgin useEffect invoked");
  }, [userInfo.recentChatUsers]);

  const handleUsernameChange = (evt) => {
    setUsername(evt.target.value);
  };

  const handlePasswordChange = (evt) => {
    setPassword(evt.target.value);
  };

  async function loginClickHandler(e) {
    e.preventDefault();

    console.log(username);
    console.log(password);

    const loginResponse = await axios.post(
      get_base_api_url("user") + "/security/authenticate",
      {
        username,
        password,
      }
    );

    localStorage.setItem("access_token", loginResponse.data.data);
    console.log(
      "Token from local storage is",
      localStorage.getItem("access_token")
    );
    console.log("loginResponse is", loginResponse);

    const loggedInUserResponse = await axios.get(
      get_base_api_url("user") + "/users",
      {
        params: { usernames: [username] },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    const user = loggedInUserResponse.data[0];
    console.log("user is", user);

    const cl = await getRsocketClient(user);

    console.log("just before set-client in Login click handler cl is", cl);
    dispatch({ type: "set-client", payload: cl });
    dispatch({ type: "set-loggedin-user", payload: user });
    new Promise((resolve, reject) => {
      console.log("post getting the client..inside the promise");
      const requester = cl.requestStream(
        {
          data: Buffer.from(JSON.stringify({ username: user.username })),
          metadata: Buffer.concat([
            Buffer.from(String.fromCharCode("/chat.receiveMessage".length)),
            Buffer.from("/chat.receiveMessage"),
          ]),
        },
        1,
        {
          onError: (e) => {
            console.log("Error has occured within request stream");
            console.log(e);
          },
          onNext: (payload, isComplete) => {
            console.log(
              `payload[data: ${payload.data}; metadata: ${payload.metadata}]|${isComplete}`
            );

            const messageReceived = JSON.parse(payload.data);
            dispatch({
              type: "add-message",
              payload: {
                message: messageReceived,
                username: messageReceived.senderId,
                chatRoomId: messageReceived.chatRoomId,
              },
            });

            const usernames = userInfo.recentChatUsers.map(
              (user) => user.username
            );
            console.log(
              "usernames are",
              usernames,
              "user.email is ",
              user.username
            );
            if (!usernames.includes(messageReceived.senderId)) {
              axios
                .get(get_base_api_url("user") + "/users", {
                  params: { usernames: [messageReceived.senderId] },
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "access_token"
                    )}`,
                  },
                })
                .then((response) => {
                  console.log("search users response", response);
                  console.log(response.data);
                  const users = response.data;
                  console.log(
                    "fetched users for displaying recent chats",
                    users
                  );

                  const user = users[0];
                  dispatch({ type: "add-recent-chat-user", payload: user });
                  dispatch({ type: "set-selected-user", payload: user });
                })
                .catch((error) => console.log(error));
            }

            requester.request(100000);

            if (isComplete) {
              resolve(payload);
            }
          },
          onComplete: () => {
            resolve(null);
          },
          onExtension: () => {},

          request: (n) => {
            console.log(`inside request, just logging (${n})`);
          },
        }
      );
    }).catch((e) => {
      console.log("-------------ERRORRRRRR-------------");
      console.error(e);
    });
  }

  return (
    <div>
      <div className="container-login">
        <input type="checkbox" id="check" />
        <div className="login form">
          <header>Login</header>
          <form action="#">
            <input
              type="text"
              placeholder="Enter your email"
              value={username}
              onChange={handleUsernameChange}
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
            />
            <a href="#">Forgot password?</a>
            <input
              type="submit"
              className="button"
              value="Login"
              onClick={loginClickHandler}
            />
          </form>
          <div className="signup">
            <span className="signup">
              Don't have an account?
              <label for="check">Signup</label>
            </span>
          </div>
        </div>
        <Signup />
      </div>
    </div>
  );
}

export default Login;
