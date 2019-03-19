# kepler.gl csh_fork

demonstrating the custom application and extension of kepler:

* loading kepler with a custom config
* including custom deck.gl layers in the kepler.gl application infrastructure

# setup
* (make sure that all hidden files that come with the repo are also copied to the folder where you will build the app)
* Run

      nvm install
      yarn --ignore-engines
      (this will only work if the hidden .nvm file is in the root)


# building a static app

go to the app folder (in /examples) and run

      yarn --ignore-engines

the demo app in the example folder is by default built “hot” - meaning, there are no static output files.

**Hot:** Output files are created at & destroyed after runtime
=> good for developing as the hot-reload refreshes the page after changes to the app.
==> to run the demo in this mode, simply run **npm start** in the **root** project folder


**Build:umd:** creates a bundle.js that can be loaded into an html page for client side apps

      ! add the following lines to the respective files in the demo/example/app folder !

>**node package.json script config:**

    {
      "scripts": {
        "start": "webpack-dev-server --progress --hot --open",
        "build:umd": "webpack --progress --env.prod"
      },

> **webpack.config.js output file specification**

    output: {
    path: resolve('./umd'), //output folder
    filename: 'bundle.js',  //output file name
    library: '[name]',
    libraryTarget: 'umd'
    },


>==> run npm run-script build:umd from the demo/example/app folder to create a static bundle.js


**caution:** it could happen that the build process will throw a "heap out of memory" exception.
in this case, add the following to your environment variables (osx) in order to increase the heap size:

              cd /kepler.gl_root/
              export NODE_OPTIONS="--max_old_space_size=4096"

**caution:** the static bundle does not work when 'appRoutes' are used in the application.
to circumvent this issue, remove all references too appRotes from the main.js (the webpack entry point):

    import {buildAppRoutes} from './utils/routes';

    const appRoute = buildAppRoutes(App);

            {appRoute}

=> see  /examples/econdata-preconfig for a working example


# loading kepler with a custom config
the tutorial on vis.academy describes how to launch the kepler.gl demo with pre-loaded data & configuration:
http://vis.academy/#/kepler.gl/3-load-config

=> a working example can be found in the */examples/econdata-preconfig* folder.
(please note that the data is not hosted in the repository.)


# tutorial compatibility
there are some compatibility issues between the code in the tutorial and the latest release of kepler.gl.

the tutorial uses an outdated version of webpack.
=> the current webpack version (+4.0) handles json file loading natively


**fix:**
=> remove this module from the webpack.config:

    {
    test: /\.json$/,
    loader: 'json-loader',
    exclude: [/node_modules/]
    }

=> change the way the json files were loaded from:

    import autConfig from './data/austria_config';
    import deuConfig from './data/germ_config';
    import usaConfig from './data/us_config';

to:

    const autConfig = require('./data/austria_config.json');
    const deuConfig = require('./data/germ_config.json');
    const usaConfig = require('./data/us_config.json');


# writing custom deck.gl layers
see http://vis.academy/#/custom-layers/setup

(additional implementation hints coming soon)

**caution:** keep in mind that the tutorial code is outdated

# integrating custom deck.gl layers into kepler.gl

(coming soon)
