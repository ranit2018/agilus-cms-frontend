import { combineReducers } from "redux";

// Import reducer files
import Auth from "./reducers/auth";



export const AppCombineReducers = combineReducers({
    auth: Auth,
   
});
