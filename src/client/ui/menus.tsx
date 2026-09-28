import React from "@rbxts/react";
import { MenuId } from "client/store";
import { SettingsContent } from "./content/settings";
import { ShopContent } from "./content/shop";

interface MenuDef {
	/** Topbar button text and panel title. */
	label: string;
	Content: () => React.Element;
}

/**
 * Every topbar menu, in one place. `Record<MenuId, MenuDef>` means adding an id
 * to `MENU_IDS` without adding its menu here is a compile error — the topbar
 * button and the panel are both derived from this table, so they cannot drift.
 */
export const MENUS: Record<MenuId, MenuDef> = {
	shop: { label: "Shop", Content: ShopContent },
	settings: { label: "Settings", Content: SettingsContent },
};
