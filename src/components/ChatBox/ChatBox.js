import "./ChatBox.scss";
import ChatNavigationPanel from "./ChatNavigationPanel";
import { useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AppStateContext, DispatcherContext } from "../../context/AppContext";
import moment from "moment";

export default function ChatBox() {
  const { userInfo, rsocketClient, chatState } = useContext(AppStateContext);
  const [typedMessage, setTypedMessage] = useState("");
  const [chatSessionId, setChatSessionId] = useState("");
  const dispatch = useContext(DispatcherContext);
  const handleTextAreaChange = (e) => {
    setTypedMessage(e.target.value);
  };

  //const renderedMessages =

  const commentEnterSubmit = (e) => {
    if (e.key === "Enter" && e.shiftKey == false) {
      const data = { content: e.target.value };
      return handleSendButtonClick(e);
    }
  };

  const handleSendButtonClick = (e) => {
    e.preventDefault();
    console.log("inside send button click", rsocketClient.client);
    let val = chatSessionId;
    console.log("selected user is :", userInfo.selectedUser);
    if (!chatSessionId) {
      val = uuidv4();
      setChatSessionId(uuidv4());
    }

    let chatRoomId;
    if (userInfo.selectedUser && chatState[userInfo.selectedUser.username]) {
      chatRoomId = chatState[userInfo.selectedUser.username].chatRoomId;
    }

    const jsonMessage = {
      senderId: userInfo.loggedInUser.username,
      receiver: userInfo.selectedUser.username,
      content: typedMessage,
      chatRoomId: chatRoomId,
    };

    console.log(" jsonMessage", jsonMessage);
    const apiUrl = `/chat.sendSingleMessage`;
    const requester = rsocketClient.client.requestResponse(
      {
        data: Buffer.from(JSON.stringify(jsonMessage)), //Buffer.from(JSON.stringify({ sender: "hello" })),
        metadata: Buffer.concat([
          Buffer.from(String.fromCharCode(apiUrl.length)),
          Buffer.from(apiUrl),
        ]),
      },
      {
        onError: (e) => console.log(e), //reject(e)
        onNext: (payload, isComplete) => {
          console.log(
            `payload[data: ${payload.data}; metadata: ${payload.metadata}]|${isComplete}`
          );
          const response = JSON.parse(payload.data);
          console.log("chatRoomId is", response.chatRoomId);

          dispatch({
            type: "add-message",
            payload: {
              message: jsonMessage,
              chatRoomId: response.chatRoomId,
              username: userInfo.selectedUser.username,
            },
          });
          if (isComplete) {
            //resolve(payload);
          }
        },
        onComplete: () => {
          console.log("request resposne flow for sending message completing");
        },
        onExtension: () => {},
        request: (n) => {
          console.log("n is ", n);
          console.log(`request(${n})`);
          requester.onNext(
            {
              data: Buffer.from(
                JSON.stringify({
                  content: "from req response rakesh.gupta@gmail.com",
                })
              ),
            },
            false
          );
        },
        cancel: () => {},
      }
    );

    setTypedMessage("");
  };

  return (
    <form>
      <div>
        <h1 style={{ textAlign: "center", color: "black" }}>
          Welcome {userInfo.loggedInUser.firstName}
        </h1>

        <div className="container clearfix">
          <ChatNavigationPanel />

          <div className="chat">
            <div className="chat-header clearfix">
              <img
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg"
                alt="avatar"
              />

              <div className="chat-about">
                <div className="chat-with">
                  Chat with{" "}
                  {userInfo.selectedUser ? userInfo.selectedUser.firstName : ""}
                </div>
                <div className="chat-num-messages">already 1 902 messages</div>
              </div>
              <i className="fa fa-star"></i>
            </div>

            <div className="chat-history">
              <ul>
                {userInfo.selectedUser &&
                chatState[userInfo.selectedUser.username] ? (
                  chatState[userInfo.selectedUser.username].messages.map(
                    (message) => {
                      if (message.senderId !== userInfo.loggedInUser.username) {
                        return (
                          <li>
                            <div class="message-data">
                              <span class="message-data-name">
                                <i class="fa fa-circle online"></i>{" "}
                                {userInfo.selectedUser.firstName +
                                  " " +
                                  userInfo.selectedUser.lastName}
                              </span>
                              <span class="message-data-time">
                                {moment
                                  .utc(message.insertTs)
                                  .local()
                                  .format("Do MMM YYYY, h:mm a")}
                              </span>
                            </div>
                            <div class="message my-message">
                              {message.content}
                            </div>
                          </li>
                        );
                      } else {
                        return (
                          <li class="clearfix">
                            <div class="message-data align-right">
                              <span class="message-data-time">
                                {moment
                                  .utc(message.insertTs)
                                  .local()
                                  .format("Do MMM YY, h:mm a")}
                              </span>{" "}
                              &nbsp; &nbsp;
                              <span class="message-data-name">
                                {userInfo.loggedInUser.firstName +
                                  " " +
                                  userInfo.loggedInUser.lastName}
                              </span>
                              <i class="fa fa-circle me"></i>
                            </div>
                            <div class="message other-message float-right">
                              {message.content}
                            </div>
                          </li>
                        );
                      }
                    }
                  )
                ) : (
                  <li></li>
                )}
              </ul>
            </div>

            <div className="chat-message clearfix">
              <textarea
                type="submit"
                value={typedMessage}
                onChange={handleTextAreaChange}
                onKeyDown={commentEnterSubmit}
                name="message-to-send"
                id="message-to-send"
                placeholder="Type your message"
                rows="3"
              ></textarea>
              <i className="fa fa-file-o"></i> &nbsp;&nbsp;&nbsp;
              <i className="fa fa-file-image-o"></i>
              <button onClick={handleSendButtonClick}>Send</button>
            </div>
          </div>
        </div>

        <script id="message-template" type="text/x-handlebars-template">
          <li className="clearfix">
            <div className="message-data align-right">
              <span className="message-data-time">
                {new Date().toLocaleTimeString()}, Today
              </span>{" "}
              &nbsp; &nbsp;
              <span className="message-data-name">Olia</span>{" "}
              <i className="fa fa-circle me"></i>
            </div>
            <div className="message other-message float-right">
              {/*{messageOutput}*/}
              Test message output
            </div>
          </li>
        </script>

        <script
          id="message-response-template"
          type="text/x-handlebars-template"
        >
          <li>
            <div className="message-data">
              <span className="message-data-name">
                <i className="fa fa-circle online"></i> Vincent
              </span>
              <span className="message-data-time">
                {new Date().toLocaleTimeString()}, Today
              </span>
            </div>
            <div className="message my-message">
              {/*{response}*/}
              Hello World Response
            </div>
          </li>
        </script>
      </div>
    </form>
  );
}
