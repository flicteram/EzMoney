import { Document } from "@rbxts/lapis";
import { RunService } from "@rbxts/services";
import { logDebug, logWarn } from "shared/log";
import { PlayerData, playerKey, selectPlayerData } from "shared/store";
import { store } from "../store";
import { playerCollection } from "./collection";

const KEY_PREFIX = "player_";
/** Live servers must not silently reset a player's save; Studio should not kick. */
const KICK_ON_LOAD_FAILURE = !RunService.IsStudio();
const KICK_MESSAGE = "Your data failed to load. Please rejoin.";

const documents = new Map<Player, Document<PlayerData>>();

function keyFor(player: Player) {
	return `${KEY_PREFIX}${playerKey(player)}`;
}

/**
 * Loads the player's document, seeds the store with it, and keeps the document
 * in sync so Lapis' autosave (and the final close) persist current store state.
 */
export async function loadProfile(player: Player) {
	const id = playerKey(player);

	try {
		const document = await playerCollection.load(keyFor(player), [player.UserId]);

		// The player may have left while the load was in flight.
		if (player.Parent === undefined) {
			await document.close();
			return;
		}

		document.beforeSave(() => {
			const data = store.getState(selectPlayerData(id));
			if (data !== undefined) document.write(data);
		});

		documents.set(player, document);
		store.addPlayer(id, document.read());
		logDebug(`loaded ${player.Name}`, document.read());
	} catch (err) {
		logWarn(`failed to load data for ${player.Name}: ${tostring(err)}`);
		if (KICK_ON_LOAD_FAILURE) {
			player.Kick(KICK_MESSAGE);
			return;
		}
		// Studio fallback: play with fresh, unsaved data instead of blocking dev.
		store.addPlayer(id);
	}
}

/** Saves and releases the player's document, then drops them from the store. */
export async function unloadProfile(player: Player) {
	const id = playerKey(player);
	const document = documents.get(player);
	documents.delete(player);

	if (document !== undefined) {
		try {
			await document.close();
		} catch (err) {
			logWarn(`failed to save data for ${player.Name}: ${tostring(err)}`);
		}
	}

	store.removePlayer(id);
	store.clearSession(id);
}

/** Closes every open document so a shutting-down server does not lose writes. */
export function closeAllProfiles() {
	// Snapshot first: `unloadProfile` removes its own entry from `documents`.
	const open: Player[] = [];
	for (const [player] of documents) open.push(player);

	// BindToClose may yield: hold the server open until every save has settled.
	// `unloadProfile` swallows its own errors, so this can never reject.
	Promise.all(open.map((player) => unloadProfile(player))).await();
}
