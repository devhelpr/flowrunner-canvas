var gulp = require('gulp');
var ts = require('gulp-typescript');
var startFlowStudioServer = require('./server/startFlowStudioServer');
var flowRunner = require('@devhelpr/flowrunner-redux').getFlowEventRunner();
flowRunner.start({flow: []}).then(function (services) {


  const metaDataInfo = flowRunner.getTaskMetaData().sort((a, b) => {
    if (a.fullName < b.fullName) {
      return -1;
    }
    if (a.fullName > b.fullName) {
      return 1;
    }
    return 0;
  });
  console.log(metaDataInfo);
  var named = require('vinyl-named'),   
      path = require("path"),
      webpackIgnorePlugin = require('webpack').IgnorePlugin;

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
            publicPath: "/lib"
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
              }              
            ]
          },
          resolve:
          {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
  //            handlebars: 'handlebars/dist/handlebars.min.js'
            },
            
          },
          plugins:[
            new webpackIgnorePlugin({
              resourceRegExp: /^\.\/locale$/,
              contextRegExp: /moment$/
            })
          ]        
        }));
        //.pipe(plumber(plumberOptions(false)))
        //;
    
    return task.pipe(gulp.dest('./lib'));
  };

  gulp.task('startFlowServer', function(cb) {
    startFlowStudioServer.start('./data/stored-flow.json',metaDataInfo);
    cb();
  });

  gulp.task('build', function() { return buildTypescript() } );

  gulp.task('default', gulp.series('build', 'startFlowServer', function () {
    gulp.watch('src/**/*.{ts,tsx}', buildTypescript);
  }));

});