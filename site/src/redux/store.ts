import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import packetDataReducer from './reducers/packetDataSlice';
import projectIdReducer from './reducers/projectIdSlice';


export const store = configureStore({
  reducer: {
    packetData: packetDataReducer,
    projectId: projectIdReducer
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
