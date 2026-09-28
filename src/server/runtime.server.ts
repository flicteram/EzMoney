import { Players } from "@rbxts/services";
import { logDebug, logInfo, logWarn } from "shared/log";
import { getRemoteEvent, RemoteNames } from "shared/remotes";
import { playerKey } from "shared/store";
import { closeAllProfiles, loadProfile, unloadProfile } from "./data/profiles";
import { selectLastClaimAt, store } from "./store";

const REWARD_AMOUNT = 50;
/** Monotonic seconds (`os.clock`), not wall time — this measures an interval. */
const REWARD_COOLDOWN_SECONDS = 5;

const claimRemote = getRemoteEvent(RemoteNames.ClaimReward);

function onPlayerAdded(player: Player) {
	logDebug(`${player.Name} joined`);
	loadProfile(player).catch((err) => logWarn(`load failed for ${player.Name}: ${tostring(err)}`));
}

function onPlayerRemoving(player: Player) {
	unloadProfile(player).catch((err) => logWarn(`unload failed for ${player.Name}: ${tostring(err)}`));
}

// The server owns every mutation of the shared state; the client only asks.
claimRemote.OnServerEvent.Connect((player) => {
	const id = playerKey(player);
	const now = os.clock();
	const lastClaim = store.getState(selectLastClaimAt(id));

	if (lastClaim !== undefined && now - lastClaim < REWARD_COOLDOWN_SECONDS) return;

	// Cooldown first: if the grant somehow fails, the player is rate-limited
	// rather than able to retry immediately.
	store.markClaimed(id, now);
	store.addCoins(id, REWARD_AMOUNT);
});

Players.PlayerAdded.Connect(onPlayerAdded);
Players.PlayerRemoving.Connect(onPlayerRemoving);
for (const player of Players.GetPlayers()) onPlayerAdded(player);

game.BindToClose(closeAllProfiles);

logInfo("server started");
