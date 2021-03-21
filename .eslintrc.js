module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: [
		'airbnb-base',
	],
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module',
	},
	rules: {
		'linebreak-style': 0,
		'max-len': [1, 120, 4],
		indent: ['error', 'tab'],
		'no-console': 0,
		// Airbnb linter has 'no-tabs' active as default
		// https://stackoverflow.com/questions/40893518/eslint-unexpected-tab-character-when-indent-rule-set-to-tab
		'no-tabs': 0,
		'arrow-body-style': 0,
	},
};
