import { createCollection, setConfig } from "@rbxts/lapis";
import MockDataStoreService from "@rbxts/mockdatastoreservice";
import { RunService } from "@rbxts/services";
import { t } from "@rbxts/t";
import { logWarn } from "shared/log";
import { DEFAULT_PLAYER_DATA, PlayerData } from "shared/store";

/**
 * Studio playtests use an in-memory DataStore so they never touch live data or
 * burn request budget. Flip this to false to test real persistence in Studio
 * (needs Game Settings > Security > Enable Studio Access to API Services).
 */
const USE_MOCK_IN_STUDIO = true;

if (RunService.IsStudio() && USE_MOCK_IN_STUDIO) {
	setConfig({ dataStoreService: MockDataStoreService });
	logWarn("using MockDataStoreService - saves are in-memory only");
}

const validatePlayerData = t.strictInterface({
	coins: t.number,
	level: t.number,
});

export const playerCollection = createCollection<PlayerData>("PlayerData", {
	defaultData: DEFAULT_PLAYER_DATA,
	validate: validatePlayerData,
	// Append migrations here when PlayerData's shape changes; order is oldest first.
	// migrations: [{ migrate: (old) => ({ ...old, level: 1 }) }],
});
