import { InferState, combineProducers } from "@rbxts/reflex";
import { sharedSlices } from "shared/store";
import { receiverMiddleware } from "./receiver";
import { uiSlice } from "./slices/ui";

/** Shared slices (filled in by the server) plus client-only slices. */
export const store = combineProducers({
	...sharedSlices,
	ui: uiSlice,
}).applyMiddleware(receiverMiddleware);

export type ClientStore = typeof store;
export type ClientState = InferState<ClientStore>;

export * from "./hooks";
export * from "./slices/ui";
