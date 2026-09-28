/** Values shared by client and server. Rename GAME_NAME once the game has a title. */
export const GAME_NAME = "Ez Money";

/**
 * Design tokens. Every dimension here is an **unscaled 1080p value** and must be
 * passed through `px()` at the call site — that is why they are raw numbers and
 * not baked `UDim`/`UDim2`, which cannot be rescaled once constructed.
 */
export const UI = {
	/** Base DisplayOrder for our ScreenGuis; TopbarPlus sits above this. */
	displayOrder: 10,
	panel: { width: 420, height: 300, titleBar: 44 },
	radius: { sm: 8, md: 10 },
	accent: Color3.fromRGB(88, 130, 255),
	background: Color3.fromRGB(24, 26, 32),
	backgroundLight: Color3.fromRGB(34, 37, 46),
	text: Color3.fromRGB(240, 242, 248),
	textDim: Color3.fromRGB(160, 166, 180),
} as const;
