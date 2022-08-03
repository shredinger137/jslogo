import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import packetDataReducer from './reducers/packetDataSlice';

export const store = configureStore({
  reducer: {
    packetData: packetDataReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
