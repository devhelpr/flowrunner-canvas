const { join } = require('path');

module.exports = {
  plugins: [
    require('postcss-import')({}),
    require('tailwindcss/nesting')({}),
    require('tailwindcss')({
      config: join(__dirname, 'tailwind.config.js')
    }),
    require('autoprefixer')({
      overrideBrowserslist: ['last 2 versions', 'ie >= 11'],
      grid: true,
    }),
],
};
