import { createProducer } from "@rbxts/reflex";

/** Server-authoritative per-player data, replicated to every client. */
export interface PlayerData {
	readonly coins: number;
	readonly level: number;
}

export const DEFAULT_PLAYER_DATA: PlayerData = {
	coins: 0,
	level: 1,
};

export interface PlayersState {
	readonly [playerId: string]: PlayerData | undefined;
}

const initialState: PlayersState = {};

export const playersSlice = createProducer(initialState, {
	addPlayer: (state, playerId: string, data: PlayerData = DEFAULT_PLAYER_DATA) => ({
		...state,
		[playerId]: data,
	}),

	removePlayer: (state, playerId: string) => ({
		...state,
		[playerId]: undefined,
	}),

	addCoins: (state, playerId: string, amount: number) => {
		const data = state[playerId];
		if (data === undefined) return state;
		return {
			...state,
			[playerId]: { ...data, coins: data.coins + amount },
		};
	},

	setLevel: (state, playerId: string, level: number) => {
		const data = state[playerId];
		if (data === undefined) return state;
		return {
			...state,
			[playerId]: { ...data, level },
		};
	},
});

/** Canonical key for a player inside the `players` slice. */
export const playerKey = (player: Player) => tostring(player.UserId);
