import { CombineProducers, InferState } from "@rbxts/reflex";
import { playersSlice } from "./slices/players";

/**
 * Slices that live on the server and replicate to clients.
 * Client- and server-only slices are added in `client/store` and `server/store`.
 */
export const sharedSlices = {
	players: playersSlice,
};

export type SharedProducers = typeof sharedSlices;
export type SharedState = InferState<CombineProducers<SharedProducers>>;

export * from "./selectors";
export * from "./slices/players";
