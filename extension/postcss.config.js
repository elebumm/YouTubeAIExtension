/**
 * @type {import('postcss').ProcessOptions}
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "@thedutchcoder/postcss-rem-to-px": {
      baseValue: 16
    }
  }
}
