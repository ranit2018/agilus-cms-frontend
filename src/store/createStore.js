import { createStore } from "redux";
import { persistStore, persistReducer } from 'redux-persist'    // persist the current state
import storage from 'redux-persist/lib/storage' // storage to store state data
import { AppCombineReducers } from "./combineReducers";
import { Enhancers } from "./enhancer";

// assign the root and storage in persist configuration
const persistConfig = {
    key: 'root',
    //version: 0,     // let assign the current version to 0
    //debug: true,    // debug persistor
    storage
    //stateReconciler: autoMergeLevel2
}

// overwrite combine reducer functions
const persistedReducer = persistReducer(persistConfig, AppCombineReducers)

// create store with enhancers
let store = createStore(persistedReducer, Enhancers)

// persist store
let persistor = persistStore(store)

// export both
export { store, persistor }


//export const createAppStore = createStore(AppCombineReducers, Enhancers);