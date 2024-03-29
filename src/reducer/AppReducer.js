export default function appReducer(state, action) {
  console.log(
    "entered here in add, aaction is, and message is ",
    state,
    action
  );

  switch (action.type) {
    //messges
    case "add-message": {
      console.log("inside reducer: add messages");
      if (
        state.chatState[action.payload.username] &&
        state.chatState[action.payload.username].messages
      ) {
        return {
          ...state,
          chatState: {
            ...state.chatState,
            [action.payload.username]: {
              messages: [
                ...state.chatState[action.payload.username].messages,
                action.payload.message,
              ],
              chatRoomId: action.payload.chatRoomId,
            },
          },
        };
      } else {
        return {
          ...state,
          chatState: {
            ...state.chatState,
            [action.payload.username]: {
              messages: [action.payload.message],
              chatRoomId: action.payload.chatRoomId,
            },
          },
        };
      }
    }

    case "prepend-messages": {
      if (
        state.chatState[action.payload.username] &&
        state.chatState[action.payload.username].messages
      ) {
        return {
          ...state,
          chatState: {
            ...state.chatState,
            [action.payload.username]: {
              messages: [
                ...action.payload.messages,
                ...state.chatState[action.payload.username].messages,
              ],
              chatRoomId: action.payload.chatRoomId,
            },
          },
        };
      } else {
        return {
          ...state,
          chatState: {
            ...state.chatState,
            [action.payload.username]: {
              messages: action.payload.messages,
              chatRoomId: action.payload.chatRoomId,
            },
          },
        };
      }
    }

    //rsocket-client
    case "set-client": {
      console.log("inside reducer: set client");
      return {
        ...state,
        rsocketClient: { ...state.rsocketClient, client: action.payload },
      };
    }

    //userinfo
    case "set-loggedin-user": {
      return {
        ...state,
        userInfo: { ...state.userInfo, loggedInUser: action.payload },
      };
    }

    case "set-selected-user": {
      return {
        ...state,
        userInfo: { ...state.userInfo, selectedUser: action.payload },
      };
    }

    case "add-recent-chat-user": {
      const usernames = state.userInfo.recentChatUsers.map(
        (user) => user.username
      );

      if (!usernames.includes(action.payload.username)) {
        return {
          ...state,
          userInfo: {
            ...state.userInfo,
            recentChatUsers: [
              action.payload,
              ...state.userInfo.recentChatUsers,
            ],
          },
        };
      } else {
        return state;
      }
    }

    case "set-recent-chat-users": {
      return {
        ...state,
        userInfo: { ...state.userInfo, recentChatUsers: action.payload },
      };
    }

    default:
      throw Error("Unknown action type: " + action.type);
  }
}
