import React from "@rbxts/react";
import { UI } from "shared/constants";
import { usePx } from "../hooks/use-px";

/** Body of the Settings panel. Client-only preferences belong in the `ui` slice. */
export function SettingsContent() {
	const px = usePx();

	return (
		<textlabel
			key="Placeholder"
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Gotham}
			TextSize={px(15)}
			TextColor3={UI.textDim}
			TextWrapped={true}
			Text="Settings go here. Client-only preferences belong in the ui slice."
		/>
	);
}
