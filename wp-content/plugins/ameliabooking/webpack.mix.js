let mix = require('laravel-mix')

mix.setResourceRoot('../../')

mix.setPublicPath('public')

const webpack = require('webpack')

mix
  .js('assets/js/backend/amelia-booking.js', 'public/js/backend')
  .js('assets/js/frontend/amelia-booking.js', 'public/js/frontend')
  .less('assets/less/backend/amelia-booking.less', 'public/css/backend')
  .less('assets/less/external/vendor.less', 'public/css/frontend')
  .less('assets/less/external/quill.less', 'public/css/frontend')
  .less('assets/less/frontend/amelia-booking.less', 'public/css/frontend/amelia-booking-1-0-67.css')
  .less('assets/less/backend/elementor.less', 'public/css/frontend')
  .copyDirectory('assets/img', 'public/img')
  .copyDirectory('assets/js/tinymce', 'public/js/tinymce')
  .copyDirectory('assets/js/gutenberg', 'public/js/gutenberg')
  .copyDirectory('assets/js/plugins', 'public/js/plugins')
  .copyDirectory('assets/js/paddle', 'public/js/paddle')
  .copyDirectory('assets/js/gutenberg/amelia-booking', 'public/js/gutenberg/amelia-booking')
  .copyDirectory('assets/js/gutenberg/amelia-catalog', 'public/js/gutenberg/amelia-catalog')
  .copyDirectory('assets/js/gutenberg/amelia-events', 'public/js/gutenberg/amelia-events')
  .copyDirectory('assets/js/gutenberg/amelia-step-booking', 'public/js/gutenberg/amelia-step-booking')
  .webpackConfig({
    entry: {
      app: ['idempotent-babel-polyfill', './assets/js/backend/amelia-booking.js', './assets/js/frontend/amelia-booking.js']
    },
    output: {
      chunkFilename: process.env.NODE_ENV !== 'production' ? 'js/chunks/amelia-booking-[name].js' : 'js/chunks/amelia-booking-[name]-[hash].js',
      publicPath: '',
      jsonpFunction: 'wpJsonpAmeliaBookingPlugin'
    },
    plugins: [
      new webpack.DefinePlugin({
        'AMELIA_LITE_VERSION': true
      })
    ]
  })

if (!mix.inProduction()) {
  mix.sourceMaps()
}
