import React, { useMemo } from "@rbxts/react";
import { UI } from "shared/constants";
import { MENU_IDS, selectOpenMenu, useRootProducer, useRootSelector } from "client/store";
import { Panel } from "./components/panel";
import { TopbarButton, useTopbar } from "./hooks/use-topbar";
import { MENUS } from "./menus";

/** Root of the client UI: one topbar button and one panel per entry in `MENUS`. */
export function App() {
	const producer = useRootProducer();
	const openMenu = useRootSelector(selectOpenMenu);

	const buttons = useMemo<TopbarButton[]>(
		() =>
			MENU_IDS.map((id) => ({
				id,
				label: MENUS[id].label,
				onToggled: (isSelected) => (isSelected ? producer.setOpenMenu(id) : producer.closeMenu(id)),
			})),
		[producer],
	);

	useTopbar(buttons);

	return (
		<screengui
			key="MainUI"
			ResetOnSpawn={false}
			IgnoreGuiInset={true}
			DisplayOrder={UI.displayOrder}
			ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
		>
			{MENU_IDS.map((id) => {
				const { label, Content } = MENUS[id];
				return (
					<Panel
						key={id}
						title={label}
						visible={openMenu === id}
						onClose={() => producer.closeMenu(id)}
					>
						<Content />
					</Panel>
				);
			})}
		</screengui>
	);
}
