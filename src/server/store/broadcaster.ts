import { BroadcastAction, createBroadcaster } from "@rbxts/reflex";
import { getRemoteEvent, RemoteNames } from "shared/remotes";
import { sharedSlices } from "shared/store";

const startRemote = getRemoteEvent(RemoteNames.StoreStart);
const dispatchRemote = getRemoteEvent(RemoteNames.StoreDispatch);

/**
 * Replicates `sharedSlices` to clients. Server-only slices are never broadcast,
 * so anything secret belongs in a server slice (or is stripped in `beforeDispatch`).
 */
const broadcaster = createBroadcaster({
	producers: sharedSlices,
	dispatch: (player, actions: BroadcastAction[]) => dispatchRemote.FireClient(player, actions),
});

startRemote.OnServerEvent.Connect((player) => broadcaster.start(player));

export const broadcasterMiddleware = broadcaster.middleware;
