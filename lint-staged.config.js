export default {
  "*.js": ["eslint --fix --no-warn-ignored", "prettier --write"],
  "*.{json,md,yml,yaml,css,html}": "prettier --write",
};
