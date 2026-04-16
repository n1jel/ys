import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers, Middleware } from 'redux'
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import { configureStore } from '@reduxjs/toolkit'
import auth from './auth'
import load from './load'
import CommanReducer from './CommanReducer'
import theme from './Theme'
import calldata from './Call'
import creds from './creds'
import uploadReducer from './uploadReducer'
import appstate from './appstate'
import splashshown from './splashshown'
import ChatCount from './ChatCount'

const reducers = combineReducers({
  auth,
  load,
  CommanReducer,
  theme,
  calldata,
  creds,
  uploadReducer,
  appstate,
  splashshown,
  ChatCount
})
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ["auth", "theme", "creds", "uploadReducer", "splashshown"],
}

const persistedReducer = persistReducer(persistConfig, reducers)

const Store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    return middlewares
  }
})
const persistor = persistStore(Store)
export { Store, persistor }