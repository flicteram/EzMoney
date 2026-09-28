import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { ReflexProvider } from "@rbxts/react-reflex";
import { Players } from "@rbxts/services";
import { store } from "./store";
import { App } from "./ui/app";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");

const root = createRoot(new Instance("Folder"));

root.render(<ReflexProvider producer={store}>{createPortal(<App />, playerGui)}</ReflexProvider>);
