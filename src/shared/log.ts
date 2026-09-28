import { RunService } from "@rbxts/services";
import { GAME_NAME } from "./constants";

/** Debug chatter is Studio-only; warnings and errors always ship. */
const DEBUG_ENABLED = RunService.IsStudio();
const PREFIX = `[${GAME_NAME}/${RunService.IsServer() ? "server" : "client"}]`;

export function logDebug(...args: unknown[]) {
	if (!DEBUG_ENABLED) return;
	print(PREFIX, ...args);
}

export function logInfo(...args: unknown[]) {
	print(PREFIX, ...args);
}

export function logWarn(...args: unknown[]) {
	warn(PREFIX, ...args);
}
