import React from "@rbxts/react";
import { UI } from "shared/constants";
import { usePx } from "../hooks/use-px";

interface PanelProps extends React.PropsWithChildren {
	title: string;
	visible: boolean;
	onClose: () => void;
}

/**
 * Centered card with a title bar and close button. Opens and closes instantly —
 * if this ever needs a transition, drive `GroupTransparency` and `Position` from
 * a spring binding rather than animating `Size`, which re-rasterises every child.
 */
export function Panel({ title, visible, onClose, children }: PanelProps) {
	const px = usePx();

	return (
		<canvasgroup
			// Named after the menu so both panels are distinguishable in Explorer.
			key={title}
			// A hidden panel must not eat clicks.
			Visible={visible}
			Size={new UDim2(0, px(UI.panel.width), 0, px(UI.panel.height))}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={UI.background}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, px(UI.radius.md))} />
			<uistroke Color={UI.backgroundLight} Thickness={px(2)} />

			<frame
				key="TitleBar"
				Size={new UDim2(1, 0, 0, px(UI.panel.titleBar))}
				BackgroundColor3={UI.backgroundLight}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, px(UI.radius.md))} />
				<textlabel
					key="Title"
					Size={new UDim2(1, -px(56), 1, 0)}
					Position={new UDim2(0, px(16), 0, 0)}
					BackgroundTransparency={1}
					Font={Enum.Font.GothamBold}
					TextSize={px(18)}
					TextColor3={UI.text}
					TextXAlignment={Enum.TextXAlignment.Left}
					Text={title}
				/>
				<textbutton
					key="Close"
					Size={new UDim2(0, px(32), 0, px(32))}
					Position={new UDim2(1, -px(38), 0.5, 0)}
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundColor3={UI.background}
					BorderSizePixel={0}
					Font={Enum.Font.GothamBold}
					TextSize={px(16)}
					TextColor3={UI.textDim}
					Text="X"
					AutoButtonColor={true}
					Event={{ Activated: onClose }}
				>
					<uicorner CornerRadius={new UDim(0, px(UI.radius.sm))} />
				</textbutton>
			</frame>

			<frame
				key="Content"
				Size={new UDim2(1, 0, 1, -px(UI.panel.titleBar))}
				Position={new UDim2(0, 0, 0, px(UI.panel.titleBar))}
				BackgroundTransparency={1}
			>
				<uipadding
					PaddingTop={new UDim(0, px(12))}
					PaddingBottom={new UDim(0, px(12))}
					PaddingLeft={new UDim(0, px(16))}
					PaddingRight={new UDim(0, px(16))}
				/>
				{children}
			</frame>
		</canvasgroup>
	);
}
