import { DEFAULT_PLAYER_DATA, PlayerData } from "./slices/players";
import type { SharedState } from ".";

/** Selectors read `SharedState`, so they work against the client and the server store. */
export const selectPlayerData =
	(playerId: string) =>
	(state: SharedState): PlayerData | undefined =>
		state.players[playerId];

/**
 * `undefined` here means "not replicated yet", not "zero". These fall back to the
 * same defaults a fresh save gets, so the value is never a number the player
 * could not have had. If a screen needs to distinguish loading from empty, read
 * `selectPlayerData` and branch on `undefined`.
 */
export const selectCoins =
	(playerId: string) =>
	(state: SharedState): number =>
		state.players[playerId]?.coins ?? DEFAULT_PLAYER_DATA.coins;

export const selectLevel =
	(playerId: string) =>
	(state: SharedState): number =>
		state.players[playerId]?.level ?? DEFAULT_PLAYER_DATA.level;
