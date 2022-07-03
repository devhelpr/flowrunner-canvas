const { createGlobPatternsForDependencies } = require("@nrwl/react/tailwind");
const dependencies = [...createGlobPatternsForDependencies(__dirname)];

console.log("tailwind dependencies" , dependencies);

module.exports = {
  content: [
    "./views/**/*.ejs",
    "./src/**/*.{tsx,ts,js,jsx,json}",
    "./data/modules/*.json",
    ...dependencies
  ],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
  prefix: 'tw-'
};
