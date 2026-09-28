import { useEffect } from "@rbxts/react";
import { Icon } from "@rbxts/topbar-plus";
import { UI } from "shared/constants";

export interface TopbarButton {
	/** Stable id, also used as the icon's name. */
	id: string;
	label: string;
	/** rbxassetid://... — leave undefined for a label-only icon. */
	image?: string;
	alignment?: "Left" | "Center" | "Right";
	/** Fires on click; TopbarPlus keeps the selected state for us. */
	onToggled: (isSelected: boolean) => void;
}

/**
 * Creates TopbarPlus icons on mount and destroys them on unmount.
 * `buttons` is read once per identity change, so keep it module-level or memoized.
 */
export function useTopbar(buttons: readonly TopbarButton[]) {
	useEffect(() => {
		Icon.setDisplayOrder(UI.displayOrder + 1);

		const icons = buttons.map((button) => {
			const icon = new Icon()
				.setName(button.id)
				.setLabel(button.label)
				.align(button.alignment ?? "Left")
				.bindEvent("toggled", (_self, isSelected) => button.onToggled(isSelected === true));

			if (button.image !== undefined) icon.setImage(button.image);
			return icon;
		});

		return () => {
			for (const icon of icons) icon.destroy();
		};
	}, [buttons]);
}
