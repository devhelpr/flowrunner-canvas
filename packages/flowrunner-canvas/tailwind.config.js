const { join } = require('path');

const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const dependencies = [...createGlobPatternsForDependencies(__dirname, '/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}')];
console.log('dependencies', dependencies);
module.exports = {
  content: [
    './views/**/*.ejs',
    './src/**/*.{tsx,ts,js,jsx,json}',
    './data/modules/*.json',
    './data/*.json',
    '../../data/*.json',
    join(__dirname, './src/**/*.{tsx,ts,js,jsx,json}'),
    ...dependencies,
  ],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
  prefix: 'tw-',
};
