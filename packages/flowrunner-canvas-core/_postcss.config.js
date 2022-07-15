module.exports = {
  plugins: [
    require('postcss-import')({}),
    require('tailwindcss/nesting')({}),
    require('tailwindcss')({}),
    require('autoprefixer')({
      overrideBrowserslist: ['last 2 versions', 'ie >= 11'],
      grid: true,
    }),
],
};
