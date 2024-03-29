import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AppContext, {
  AppStateContext,
  DispatcherContext,
} from "../../context/AppContext";
import { fetchUsers } from "../../apicalls/users";
import { get_base_api_url } from "../../util/util";
export default function ChatNavigationPanel() {
  const [searchedUsers, setSearchedUsers] = useState([]);

  const { userInfo, rsocketClient, chatState } = useContext(AppStateContext);
  const dispatch = useContext(DispatcherContext);

  useEffect(() => {
    console.log("just triggered useEffect");
    const apiUrl = "/users.recentchatbuddies";
    const jsonMessage = {
      username: userInfo.loggedInUser.username,
      pageNumber: 0,
    };

    const recentChatRoomsRequester = rsocketClient.client.requestResponse(
      {
        data: Buffer.from(JSON.stringify(jsonMessage)),
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

          const jsonPayload = JSON.parse(payload.data);

          if (isComplete) {
            console.log("inside iscomplete", jsonPayload.chatRooms);
            console.log("length ", jsonPayload.chatRooms.length);
            if (jsonPayload.chatRooms && jsonPayload.chatRooms.length > 0) {
              const userNames = jsonPayload.chatRooms.flatMap((chatRoom) => {
                return chatRoom.participants.filter(
                  (participant) => participant != userInfo.loggedInUser.username
                );
              });
              console.log("userIds is ", userNames);

              axios
                .get(get_base_api_url("user") + "/users", {
                  params: { usernames: userNames },
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
                  handleUserClick(users[0]);
                  dispatch({ type: "set-recent-chat-users", payload: users }); //setRecentChatUsers(users);
                })
                .catch((error) => console.log(error));
            }
          }
        },
        onComplete: () => {
          console.log("request resposne flow for sending message completing");
        },
        onExtension: () => {},
        request: (n) => {
          console.log("n is ", n);
          console.log(`request(${n})`);
          recentChatRoomsRequester.onNext(
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
    console.log("just completed useEffect");
  }, []);

  const handleSearchUserClick = (user) => {
    const usernames = userInfo.recentChatUsers.map((user) => user.username);
    console.log("usernames are", usernames, "user.email is ", user.username);
    if (!usernames.includes(user.username)) {
      dispatch({ type: "add-recent-chat-user", payload: user }); //setRecentChatUsers([user, ...recentChatUsers]);
    }
    handleUserClick(user);
    setSearchedUsers([]);
  };

  const handleSearchInputChange = (e) => {
    const searchValue = e.target.value;
    console.log(searchValue);

    if (searchValue.length >= 3) {
      console.log("Search term has 3 or more chars");

      axios
        .get(get_base_api_url("user") + "/users", {
          params: { searchTerm: searchValue },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        .then((response) => {
          console.log("search users response", response);
          console.log(response.data);
          //const parsedJsonResponse = JSON.parse(response.data);
          const users = response.data.filter(
            (user) => user.username !== userInfo.loggedInUser.username
          );

          return setSearchedUsers(users);
        })
        .catch((error) => console.log(error));
    } else {
      console.log("Search term has less than 3 chars");
    }
  };

  const renderedSearchItems = searchedUsers.map((user) => (
    <li
      className="clearfix"
      key={user.emailId}
      onClick={() => handleSearchUserClick(user)}
    >
      <div className="about">
        {user.firstName} {user.lastName}
        <div className="status">
          <i className="fa fa-circle online"></i> online
        </div>
      </div>
    </li>
  ));

  const handleUserClick = (user) => {
    console.log("inside handleUserClick start selected user is ", user);

    if (
      !chatState[user.username] ||
      !chatState[user.username].messages ||
      chatState[user.username].messages.length == 0
    ) {
      const jsonMessage = {
        username1: userInfo.loggedInUser.username,
        username2: user.username,
        pageNumber: 0,
      };

      console.log(" jsonMessage", jsonMessage);
      const apiUrl = `/chatroom.previousMessages`;

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
            const messages = JSON.parse(payload.data).messages;
            console.log("previous messages are", messages);
            console.log(messages.length);
            if (messages.length > 0) {
              const reversedMessages = messages.reverse();

              dispatch({
                type: "prepend-messages",
                payload: {
                  messages: reversedMessages,
                  chatRoomId: messages[0].chatRoomId,
                  username: user.username,
                },
              });
            }
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
    }

    dispatch({ type: "set-selected-user", payload: user });
    console.log("inside handleUserClick end selected user is ", user);
  };

  return (
    <div className="people-list" id="people-list">
      <div className="search">
        <div>
          <input
            type="text"
            placeholder="search"
            onChange={handleSearchInputChange}
          />
          <i className="fa fa-search"></i>
          {searchedUsers.length > 0 && (
            <div className="suggestions">
              <ul>{renderedSearchItems}</ul>
            </div>
          )}
        </div>
        <div>
          <ul className="list">
            {userInfo.recentChatUsers.map((user) => (
              <li
                className="clearfix"
                key={user.emailId}
                onClick={() => handleUserClick(user)}
              >
                <div className="about">
                  {user.firstName} {user.lastName}
                  <div className="status">
                    <i className="fa fa-circle online"></i> online
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
