import { endpoints } from "../endpoints";
export const get_base_api_url = (component) => {
  switch (component) {
    case "user":
      return endpoints.userApiBaseUrl + ":" + endpoints.userApiPort;
  }
};

export const get_base_ws_url = (component) => {
  switch (component) {
    case "chat":
      return (
        "ws://" + endpoints.chatApiBaseUrl + ":" + endpoints.chatApiBasePort
      );
  }
};
