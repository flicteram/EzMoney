import { UseProducerHook, UseSelectorHook, useProducer, useSelector } from "@rbxts/react-reflex";
import { Players } from "@rbxts/services";
import type { ClientStore } from ".";

/** Typed wrappers so components never have to name the store type. */
export const useRootProducer: UseProducerHook<ClientStore> = useProducer;
export const useRootSelector: UseSelectorHook<ClientStore> = useSelector;

/** Key used for this player inside the replicated `players` slice. */
export const LOCAL_PLAYER_ID = tostring(Players.LocalPlayer.UserId);
