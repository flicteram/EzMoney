import { createProducer } from "@rbxts/reflex";

/** Server-only state: never replicated, so it can hold anything the client must not see. */
export interface SessionState {
	readonly lastClaimAt: { readonly [playerId: string]: number | undefined };
}

const initialState: SessionState = {
	lastClaimAt: {},
};

export const sessionSlice = createProducer(initialState, {
	markClaimed: (state, playerId: string, timestamp: number) => ({
		...state,
		lastClaimAt: { ...state.lastClaimAt, [playerId]: timestamp },
	}),

	clearSession: (state, playerId: string) => ({
		lastClaimAt: { ...state.lastClaimAt, [playerId]: undefined },
	}),
});

interface WithSession {
	readonly session: SessionState;
}

export const selectLastClaimAt = (playerId: string) => (state: WithSession) =>
	state.session.lastClaimAt[playerId];
