import axios from "axios";
import { get_base_api_url } from "../util/util";

export async function fetchUsers(usernames) {
  const response = await axios.get(get_base_api_url("user") + "/users", {
    params: { usernames: usernames },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (response.status == 200) {
    return response.data;
  } else {
    return [];
  }
}
