import { createProducer } from "@rbxts/reflex";

/**
 * Every menu the topbar can open. The registry in `client/ui/menus` is typed
 * `Record<MenuId, MenuDef>`, so adding an id here without adding its menu there
 * is a compile error.
 */
export const MENU_IDS = ["shop", "settings"] as const;
export type MenuId = (typeof MENU_IDS)[number];

/** Client-only state: which menu is open. Never replicated. */
export interface UiState {
	readonly openMenu?: MenuId;
}

const initialState: UiState = {};

export const uiSlice = createProducer(initialState, {
	setOpenMenu: (state, menu: MenuId | undefined) => ({ ...state, openMenu: menu }),

	/**
	 * Identity-checked on purpose: TopbarPlus deselects the previously selected
	 * icon when a new one is picked, and that stale "off" must not close the menu
	 * that was just opened.
	 */
	closeMenu: (state, menu: MenuId) => (state.openMenu === menu ? { ...state, openMenu: undefined } : state),
});

export const selectOpenMenu = (state: { ui: UiState }) => state.ui.openMenu;
