import robloxTs from "eslint-plugin-roblox-ts";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["out/**", "include/**", "build/**", "node_modules/**", "eslint.config.mjs"],
	},
	...tseslint.configs.recommendedTypeChecked,
	robloxTs.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				// projectService comes from roblox-ts/recommended; only the root is needed.
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// Luau has no `null`; roblox-ts only supports `undefined`.
			"roblox-ts/no-null": "error",
			// `0` and `""` are truthy in Luau but falsy in TS - the classic silent bug.
			"roblox-ts/lua-truthiness": "warn",
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/no-non-null-assertion": "off",
		},
	},
	prettier,
);
