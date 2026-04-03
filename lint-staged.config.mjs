/** @type {import('lint-staged').Configuration} */
const config = {
  "*": "prettier --write --ignore-unknown",
  "*.{js,jsx,ts,tsx}": "eslint --max-warnings=0 --no-warn-ignored --fix",
};

export default config;
