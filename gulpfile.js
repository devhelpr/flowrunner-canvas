var gulp = require('gulp');
var ts = require('gulp-typescript');
var rename = require("gulp-rename");

const webpack = require('webpack');
var startFlowStudioServer = require('./server/startFlowStudioServer');
var named = require('vinyl-named'),   
    path = require("path"),
    definePlugin = require('webpack').DefinePlugin,
    webpackIgnorePlugin = require('webpack').IgnorePlugin,
    cleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;

const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin')

const ASSET_PATH = process.env.ASSET_PATH || '/';

var tsProject = ts.createProject('tsconfig.json');

/*
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,

            rxjs
            react-konva
            react-bootstrap
            jss
            react-reconciler


             konva: {
                test: /[\\/]node_modules[\\/](konva)[\\/]/,
                name: 'konva',
                chunks: 'all',
              },
            lodash: {
                test: /[\\/]node_modules[\\/](lodash)[\\/]/,
                name: 'lodash',
                chunks: 'all',
              },

              ,
              rxjscompat: {
                test: /[\\/]node_modules[\\/](rxjs-compat)[\\/]/,
                name: 'rxjscompat',
                chunks: 'all',
              }  

              reactkonva: {
                test: /[\\/]node_modules[\\/](react-konva)[\\/]/,
                name: 'reactkonva',
                chunks: 'all',
              },

              ,
              reactreconciler: {
                test: /[\\/]node_modules[\\/](react-reconciler)[\\/]/,
                name: 'reactreconciler',
                chunks: 'all',
              }   

              ,
              jss: {
                test: /[\\/]node_modules[\\/](jss)[\\/]/,
                name: 'jss',
                chunks: 'all',
              }  

              materialui: {
                test: /[\\/]node_modules[\\/](@material-ui)[\\/]/,
                name: 'materialui',
                chunks: 'all',
              },
                        runtimeChunk: 'single',

*/
function buildTypescript() {

  const gulpwebpack = require('webpack-stream');
  var task = gulp.src(['src/index.tsx','src/ui.tsx'])
      .pipe(named())
      .pipe(gulpwebpack({
        mode:"development",
        output: {
          path: path.join(__dirname, "lib"),
          pathinfo: false,
          filename:'[name].bundle.js',
          chunkFilename: "[name].canvas.chunk.js",
          publicPath: "/",
          chunkLoadingGlobal: 'flowcanvaswebpackJsonpPlugin'
        },
        experiments: {
          syncWebAssembly: true
        },
        optimization: {
          splitChunks: {    
            cacheGroups: {
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                chunks: 'all',
              },
             
              devhelpr: {
                test: /[\\/]node_modules[\\/](@devhelpr)[\\/]/,
                name: 'devhelpr',
                chunks: 'all',
              },              
              rxjs: {
                test: /[\\/]node_modules[\\/](rxjs)[\\/]/,
                name: 'rxjs',
                chunks: 'all',
              },              
              reactbootstrap: {
                test: /[\\/]node_modules[\\/](react-bootstrap)[\\/]/,
                name: 'reactbootstrap',
                chunks: 'all',
              }              
            }
          }
        },
        module: {
          rules: [
            {
              test: /\.(png|jp(e*)g|svg|gif)$/,
              use: [
                {
                  loader: 'file-loader',
                  options: {
                    name: 'images/[hash]-[name].[ext]',
                  },
                },
              ],
            },            
            {
              test: /\.tsx?$/,
              loader: 'awesome-typescript-loader',
              exclude: /node_modules/              
            }
                   
          ]
        },
        resolve:
        {
          extensions: [".ts", ".tsx", ".js", ".json",".wasm"],
          alias: {
            
          },
          
        },
        plugins:[
          new webpack.DefinePlugin({
            'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH),
          }),
          new cleanPlugin(),
          /*new WasmPackPlugin({
            crateDirectory: __dirname + "/rust", 
          }),*/
          new webpackIgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/
          })      
        ]        
      }, webpack));
  
  return task.pipe(gulp.dest('./lib'));
};


function buildPluginTypescript() {

  const gulpwebpack = require('webpack-stream');
  var task = gulp.src('src-plugins/index.tsx')
      .pipe(named())
      .pipe(gulpwebpack({
        mode:"development",
        output: {
          path: path.join(__dirname, "assets"),
          pathinfo: false,
          filename:'[name].plugin.bundle.js',
          chunkFilename: "[name].plugin.chunk.js",
          publicPath: "/",
          chunkLoadingGlobal: 'webpackJsonpPlugin'
        } ,
        optimization: {
          splitChunks: {
            cacheGroups: {
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                chunks: 'all',
              }
            }
          }
        },
        module: {
          rules: [
            {
              test: /\.(png|jp(e*)g|svg|gif)$/,
              use: [
                {
                  loader: 'file-loader',
                  options: {
                    name: 'images/[hash]-[name].[ext]',
                  },
                },
              ],
            },
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
            
          },
          
        },
        plugins:[
          new webpackIgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/
          })
        ]        
      }, webpack));
  
  return task.pipe(gulp.dest('./assets'));
};

gulp.task('startFlowServer', function(cb) {
  // ['./data/stored-flow.json','./data/test-flow.json','./data/flow.json']
  startFlowStudioServer.start('./data/flows.json', 
  [{
    className: "TestCustomConfigTask",
    fullName:"TestCustomConfigTask",
    flowType:"playground",
    config: {
      presetValues: {
        "hello" : "custom"
      }
    }
  }], 
  {
    hasPreviewPlugin: true,
    isStandalone: true,
    defaultPlugins: true,
    config: {
      "TestCustomConfigTask": {
        presetValues: {
          "test" : "hello config"
        }
      }
    }
  });
  cb();
});

gulp.task('postcss', () => {
  console.log("postcss processing");
  const autoprefixer = require('autoprefixer');
  const postcss = require('gulp-postcss');
  
  var processors = [
		autoprefixer({
      overrideBrowserslist: ["last 2 versions", "ie >= 11"],
      grid: true
    })
	];
  return gulp.src('./styles/*.pcss')
    .pipe(postcss(processors))
    .pipe(rename(function (path) {
      path.extname = ".css";
    }))
    .pipe(gulp.dest('./assets'))
});

gulp.task('build', function() { return buildTypescript() } );
gulp.task('build-plugins', function() { return buildPluginTypescript() } );
gulp.task('default', gulp.series('build', 'build-plugins','postcss', 'startFlowServer', function () {
  gulp.watch('src/**/*.{ts,tsx}', gulp.series('build'));
  gulp.watch('src-plugins/**/*.{ts,tsx}', buildPluginTypescript);
  gulp.watch('styles/*.pcss', gulp.series('postcss'));
}));
