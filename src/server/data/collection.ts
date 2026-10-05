import { createCollection, setConfig } from "@rbxts/lapis";
import MockDataStoreService from "@rbxts/mockdatastoreservice";
import { RunService } from "@rbxts/services";
import { t } from "@rbxts/t";
import { logWarn } from "shared/log";
import { DEFAULT_PLAYER_DATA, PlayerData } from "shared/store";

/**
 * The production place. Only its live servers read and write real saves.
 * `undefined` until it is set, so no server counts as production by accident.
 */
const PROD_PLACE_ID: number | undefined = undefined;

/**
 * A live server of the production place. Studio never counts, even with the
 * production place open, because a Studio playtest of that place has the same
 * `PlaceId` and would otherwise write over real saves.
 */
const IS_PROD = game.PlaceId === PROD_PLACE_ID && !RunService.IsStudio();

/** The DataStore that holds every real player's save. Never change it. */
const PROD_DATA_STORE_NAME = "PlayerData";

/**
 * The DataStore every other server uses, in Studio and in other places, so
 * tests never touch real saves. Bump the number to start testing from default
 * data. Old test saves stay under the old name.
 */
const TEST_DATA_STORE_NAME = "PlayerData_Test-1";

const DATA_STORE_NAME = IS_PROD ? PROD_DATA_STORE_NAME : TEST_DATA_STORE_NAME;

/**
 * Studio playtests use an in-memory DataStore so they never touch live data or
 * burn request budget. Flip this to false to test real persistence in Studio
 * (needs Game Settings > Security > Enable Studio Access to API Services). Live
 * servers of other places always use the real DataStore, under the test name.
 */
const USE_MOCK_IN_STUDIO = true;

if (RunService.IsStudio() && USE_MOCK_IN_STUDIO) {
	setConfig({ dataStoreService: MockDataStoreService });
	logWarn(`using an in-memory "${DATA_STORE_NAME}" DataStore - saves last until the playtest stops`);
}

const validatePlayerData = t.strictInterface({
	coins: t.number,
	level: t.number,
});

export const playerCollection = createCollection<PlayerData>(DATA_STORE_NAME, {
	defaultData: DEFAULT_PLAYER_DATA,
	validate: validatePlayerData,
	// Append migrations here when PlayerData's shape changes; order is oldest first.
	// migrations: [{ migrate: (old) => ({ ...old, level: 1 }) }],
});
