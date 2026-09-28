import { InferState, combineProducers } from "@rbxts/reflex";
import { sharedSlices } from "shared/store";
import { broadcasterMiddleware } from "./broadcaster";
import { sessionSlice } from "./slices/session";

/** Shared slices (replicated) plus server-only slices (never replicated). */
export const store = combineProducers({
	...sharedSlices,
	session: sessionSlice,
}).applyMiddleware(broadcasterMiddleware);

export type ServerStore = typeof store;
export type ServerState = InferState<ServerStore>;

export * from "./slices/session";
