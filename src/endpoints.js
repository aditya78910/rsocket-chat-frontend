import local from "./config/local";

const env_str = process.env.REACT_APP_ENVIRONMENT || "local";

let env;
switch (env_str) {
  case "local":
    env = local;
    break;
}

export const endpoints = {
  userApiBaseUrl: `${env.userApiBaseUrl}`,
  userApiPort: `${env.userApiPort}`,
  chatApiBaseUrl: `${env.chatApiBaseUrl}`,
  chatApiBasePort: `${env.chatApiBasePort}`,
};
