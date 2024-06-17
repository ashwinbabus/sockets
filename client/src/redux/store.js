import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist/";
import storage from "redux-persist/lib/storage";
import loginSlice from "./loginSlice";

const reducers = combineReducers({
    login: loginSlice
});

const persistConfig = {
    key: "root",
    storage
}

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});