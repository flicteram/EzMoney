import { useMotion } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { GAME_NAME, UI } from "shared/constants";
import { getRemoteEvent, RemoteNames } from "shared/remotes";
import { selectCoins, selectLevel } from "shared/store";
import { LOCAL_PLAYER_ID, useRootSelector } from "client/store";
import { StatRow } from "../components/stat-row";
import { usePx } from "../hooks/use-px";

const claimRemote = getRemoteEvent(RemoteNames.ClaimReward);

/** Body of the Shop panel: the player's replicated stats plus the demo claim button. */
export function ShopContent() {
	const px = usePx();
	const coins = useRootSelector(selectCoins(LOCAL_PLAYER_ID));
	const level = useRootSelector(selectLevel(LOCAL_PLAYER_ID));

	// Coins roll up to their new value instead of snapping. Damping 1 keeps the
	// counter monotonic - an overshoot would show a number the player never had.
	const [coinsDisplay, coinsMotion] = useMotion(coins);

	useEffect(() => {
		coinsMotion.spring(coins, { damping: 1, frequency: 3 });
	}, [coins, coinsMotion]);

	return (
		<>
			<uilistlayout
				Padding={new UDim(0, px(8))}
				SortOrder={Enum.SortOrder.LayoutOrder}
				FillDirection={Enum.FillDirection.Vertical}
			/>
			<StatRow
				label="Coins"
				value={coinsDisplay.map((value) => string.format("%d", math.round(value)))}
				layoutOrder={1}
			/>
			<StatRow label="Level" value={`${level}`} layoutOrder={2} />
			<textbutton
				key="Claim"
				LayoutOrder={3}
				Size={new UDim2(1, 0, 0, px(40))}
				BackgroundColor3={UI.accent}
				BorderSizePixel={0}
				Font={Enum.Font.GothamBold}
				TextSize={px(15)}
				TextColor3={UI.text}
				Text="Claim 50 coins"
				AutoButtonColor={true}
				Event={{ Activated: () => claimRemote.FireServer() }}
			>
				<uicorner CornerRadius={new UDim(0, px(UI.radius.sm))} />
			</textbutton>
			<textlabel
				key="Hint"
				LayoutOrder={4}
				Size={new UDim2(1, 0, 0, px(32))}
				BackgroundTransparency={1}
				Font={Enum.Font.Gotham}
				TextSize={px(13)}
				TextColor3={UI.textDim}
				TextWrapped={true}
				Text={`${GAME_NAME}: the server grants coins and replicates them back (5s cooldown).`}
			/>
		</>
	);
}
