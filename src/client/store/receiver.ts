import { BroadcastAction, createBroadcastReceiver } from "@rbxts/reflex";
import { getRemoteEvent, RemoteNames } from "shared/remotes";

const startRemote = getRemoteEvent(RemoteNames.StoreStart);
const dispatchRemote = getRemoteEvent(RemoteNames.StoreDispatch);

/** Applies the server's actions to the client store, keeping shared slices in sync. */
const receiver = createBroadcastReceiver({
	start: () => startRemote.FireServer(),
});

dispatchRemote.OnClientEvent.Connect((actions: BroadcastAction[]) => receiver.dispatch(actions));

export const receiverMiddleware = receiver.middleware;
