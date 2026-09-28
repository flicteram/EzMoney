import { ReplicatedStorage, RunService } from "@rbxts/services";

const REMOTES_FOLDER_NAME = "Remotes";

/**
 * Minimal remote registry: the server creates instances, the client waits for them.
 * Swap for a typed networking library (e.g. @rbxts/net) if the game outgrows this.
 */
export const RemoteNames = {
	/** Client -> server: "I am ready for state", handled by the Reflex broadcaster. */
	StoreStart: "StoreStart",
	/** Server -> client: batched Reflex actions. */
	StoreDispatch: "StoreDispatch",
	/** Client -> server: demo action, the server decides whether to grant it. */
	ClaimReward: "ClaimReward",
} as const;

export type RemoteName = (typeof RemoteNames)[keyof typeof RemoteNames];

function getFolder(): Folder {
	if (RunService.IsServer()) {
		let folder = ReplicatedStorage.FindFirstChild(REMOTES_FOLDER_NAME) as Folder | undefined;
		if (folder === undefined) {
			folder = new Instance("Folder");
			folder.Name = REMOTES_FOLDER_NAME;
			folder.Parent = ReplicatedStorage;
		}
		return folder;
	}
	return ReplicatedStorage.WaitForChild(REMOTES_FOLDER_NAME) as Folder;
}

export function getRemoteEvent(name: RemoteName): RemoteEvent {
	const folder = getFolder();
	if (RunService.IsServer()) {
		let remote = folder.FindFirstChild(name) as RemoteEvent | undefined;
		if (remote === undefined) {
			remote = new Instance("RemoteEvent");
			remote.Name = name;
			remote.Parent = folder;
		}
		return remote;
	}
	return folder.WaitForChild(name) as RemoteEvent;
}
