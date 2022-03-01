import {
  AUTH_TOKEN,
  AUTH_FAILURE,
  AUTH_LOGOUT,
} from "../actions/constant";

const INTIAL_STATE = { data: "", errors: {} };

export default function (state = INTIAL_STATE, action) {
  switch (action.type) {
    case AUTH_TOKEN:
      //return { data: action.payload };
      return {
        token: action.payload.token,
      };

    case AUTH_FAILURE:
      return {
        errors: action.payload,
      };
    case AUTH_LOGOUT:
      return INTIAL_STATE;

    default:
      // persist token only if page reload
      if (state && action.type === "@@INIT") {
        let persist_token = "";

        if (localStorage.getItem("token")) {
          persist_token = localStorage.getItem("token");
        } else if (localStorage.getItem("admin_token")) {
          persist_token = localStorage.getItem("admin_token");
        }

        if (persist_token) {
          return {
            data: persist_token,
          };
        } else {
          return state;
        }
      } else {
        return state;
      }
  }
}
