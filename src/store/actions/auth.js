import axios from "../../shared/axios";
//import jwt_decode from "jwt-decode";
import { AUTH_TOKEN, AUTH_LOGOUT, AUTH_FAILURE } from "./constant";

export const adminLogin = (request, onSuccess, setErrors) => {
  return (dispatch) => {
    const username = request.username.trim(), 
      password = request.password.trim(),
      customErr = { process: "Invalid access" };

    axios
      .post("/api/adm/login", {
        username: username,
        password: password
      })
      .then((response) => {
        dispatch({
          type: AUTH_TOKEN,
          payload: response.data.token,
        });
        localStorage.setItem("admin_token", response.data.token);
        onSuccess && onSuccess();
      })
      .catch((error) => {
        switch (error.status) {
          case 404:
          case 400:
            dispatch({
              type: AUTH_FAILURE,
              payload: error.data,
            });
            setErrors(error.data.errors);
            break;

          default:
            dispatch({
              type: AUTH_FAILURE,
              payload: "",
            });
            setErrors(customErr);
            break;
        }
      });
  };
};

export const authLogout = () => {
  localStorage.removeItem("token");
  return (dispatch) => {
    dispatch({
      type: AUTH_LOGOUT,
    });
  };
};

export const adminLogout = () => {
  localStorage.removeItem("admin_token");

  return (dispatch) => {
    dispatch({
      type: AUTH_LOGOUT,
    });
  };
};
export const hrLogin = (request, onSuccess, setErrors) => {
  return (dispatch) => {
    const username = request.username.trim(),
      password = request.password.trim(),
      customErr = { process: "Invalid access" };
    axios
      .post("/api/hr/login", {
        username: username,
        password: password,
      })
      .then((response) => {
        dispatch({
          type: AUTH_TOKEN,
          payload: response.data.token,
        });
        localStorage.setItem("hr_token", response.data.token);
        onSuccess && onSuccess();
      })
      .catch((error) => {
        switch (error.status) {
          case 404:
          case 400:
            dispatch({
              type: AUTH_FAILURE,
              payload: error.data,
            });
            setErrors(error.data.errors);
            break;

          default:
            dispatch({
              type: AUTH_FAILURE,
              payload: "",
            });
            setErrors(customErr);
            break;
        }
      });
  };
};
export const hrLogout = () => {
  localStorage.removeItem("hr_token");

  return (dispatch) => {
    dispatch({
      type: AUTH_LOGOUT,
    });
  };
};