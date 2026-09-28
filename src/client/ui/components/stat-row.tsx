import React, { Binding } from "@rbxts/react";
import { UI } from "shared/constants";
import { usePx } from "../hooks/use-px";

interface StatRowProps {
	label: string;
	/** Accepts a binding so animated values do not re-render the row. */
	value: string | Binding<string>;
	layoutOrder?: number;
}

/** One "Label ......... value" line inside a panel. */
export function StatRow({ label, value, layoutOrder }: StatRowProps) {
	const px = usePx();

	return (
		<frame
			key={label}
			LayoutOrder={layoutOrder}
			Size={new UDim2(1, 0, 0, px(32))}
			BackgroundColor3={UI.backgroundLight}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, px(UI.radius.sm))} />
			<uipadding PaddingLeft={new UDim(0, px(12))} PaddingRight={new UDim(0, px(12))} />
			<textlabel
				key="Label"
				Size={new UDim2(0.5, 0, 1, 0)}
				BackgroundTransparency={1}
				Font={Enum.Font.Gotham}
				TextSize={px(14)}
				TextColor3={UI.textDim}
				TextXAlignment={Enum.TextXAlignment.Left}
				Text={label}
			/>
			<textlabel
				key="Value"
				Size={new UDim2(0.5, 0, 1, 0)}
				Position={new UDim2(0.5, 0, 0, 0)}
				BackgroundTransparency={1}
				Font={Enum.Font.GothamBold}
				TextSize={px(14)}
				TextColor3={UI.text}
				TextXAlignment={Enum.TextXAlignment.Right}
				Text={value}
			/>
		</frame>
	);
}
