var gulp = require('gulp');
var ts = require('gulp-typescript');
var startFlowStudioServer = require('./server/startFlowStudioServer');
var named = require('vinyl-named'),   
    path = require("path"),
    webpackIgnorePlugin = require('webpack').IgnorePlugin,
    cleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;

var tsProject = ts.createProject('tsconfig.json');

function buildTypescript() {

  const webpack = require('webpack-stream');
  var task = gulp.src('src/index.tsx')
      .pipe(named())
      .pipe(webpack({
        mode:"development",
        output: {
          path: path.join(__dirname, "lib"),
          pathinfo: false,
          filename:'[name].bundle.js',
          chunkFilename: "[name].chunk.js",
          publicPath: ""
        } ,
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                experimentalWatchApi: true,
              },
              exclude: /(node_modules|bower_components)/ 
            },
            {
              test: /\.worker\.js$/,
              use: { loader: 'worker-loader' }
            }              
          ]
        },
        resolve:
        {
          extensions: [".ts", ".tsx", ".js", ".json"],
          alias: {
          },
          
        },
        plugins:[
          new cleanPlugin(),
          new webpackIgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/
          })
        ]        
      }));
  
  return task.pipe(gulp.dest('./lib'));
};

gulp.task('startFlowServer', function(cb) {
  // ['./data/stored-flow.json','./data/test-flow.json','./data/flow.json']
  startFlowStudioServer.start('./data/flows.json', 
  [], 
  {
    hasPreviewPlugin: true,
    isStandalone: true,
    defaultPlugins: true,

  });
  cb();
});

gulp.task('build', function() { return buildTypescript() } );

gulp.task('default', gulp.series('build', 'startFlowServer', function () {
  gulp.watch('src/**/*.{ts,tsx}', buildTypescript);
}));
