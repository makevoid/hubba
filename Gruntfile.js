'use strict';

module.exports = function(grunt) {

//  var banner = ['/*!',
//    ' * Hubba v<%= pkg.version %>',
//    ' *',
//    ' * Released under the GPL-2.0 license',
//    ' * http://opensource.org/licenses/GPL-2.0',
//    ' *',
//    ' * <%= grunt.template.today("yyyy-mm-dd") %>',
//    ' */\n\n'
//  ].join('\n');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    confs: {
      karmaFile: 'spec/karma.conf.js',
      siteSpec: 'spec/www',
      appSpec: 'spec/app',
      site: 'src/www',
      app: 'src/srv',
      frontEndServerPort: 8000,
      backEndServerPort: 3000,
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: [
          '<%= confs.app %>/index.js',

          '<%= confs.site %>/assets/index.js',
          '<%= confs.site %>/assets/SHA1.js',
          '<%= confs.site %>/assets/randomness.js',
          '<%= confs.site %>/assets/bencoding.js'
        ]
      },
      test: {
        src: ['<%= confs.siteSpec %>/**.js']
      }
    },
    karma: {
      options: {
        frameworks: [
          'jasmine'
        ],
        files: [
          'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.9/angular.min.js',
          'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.9/angular-mocks.js',

          '<%= confs.site %>/assets/index.js',

          '<%= confs.siteSpec %>/SHA1.js'
        ],
        exclude: [
        ],
        preprocessors: {
        },
        port: 9876,
        colors: true,
        autoWatch: false,
        browsers: [
          'Firefox',
          'Chrome'
        ],
        captureTimeout: 20000,
        singleRun: false,
        reportSlowerThan: 500,
        plugins: [
          'karma-jasmine',
          'karma-chrome-launcher',
          'karma-firefox-launcher'
        ],
        background: true
      },
      unit: {
        reporters: ['dots']
      }
    },
    connect: {
      server: {
        options: {
          port: '<%= confs.frontEndServerPort %>',
          base: '<%= confs.site %>'
        }
      },
      keepalive: {
        options: {
          keepalive: true
        }
      }
    },
    express: {
      options: {
        port: '<%= confs.backEndServerPort %>',
        script: '<%= confs.app %>/index.js'
      },
      dev: {
        options: {
          debug: true,
          /* jshint -W106 */
          node_env: 'development'
          /* jshint +W106 */
        }
      },
      prod: {
        options: {
          /* jshint -W106 */
          node_env: 'production'
          /* jshint +W106 */
        }
      },
      test: {
        options: {
          script: '<%= conf.appSpec %>/**/*.js'
        }
      }
    },
    watch: {
      feDev: {
        files: [
          '<%= confs.site %>/**/*'
        ],
        tasks: [
          'jshint',
          'karma:unit:run'
        ],
        options: {
          spawn: false
        }
      },
      beDev: {
        files: [
          '<%= confs.app %>/**/*.js'
        ],
        tasks: [
          'express:dev:stop',
          'jshint',
          'express:dev'
        ],
        options: {
          spawn: false
        }
      }
    },
    'node-inspector': {
      dev: {
        options: {
          'web-port': 1337,
          'web-host': 'localhost',
          'debug-port': 5858,
          'save-live-edit': true,
          'stack-trace-limit': 4
        }
      }
    }
  });

  // NPM Tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-node-inspector');

  // Default tasks (when type grunt on terminal).
  grunt.registerTask('default', [
    'jshint',
    'karma:unit',
    // WANT TO KEEP A SINGLE FILE W/O SERVING THIS 'connect:server',
    'watch:feDev'//,
    //'uglify'
    // WANT TO KEEP A SINGLE FILE W/O SERVING THIS 'connect:keepalive'
  ]);

  grunt.registerTask('server', [
    'jshint',
    'express:dev',
    'watch:beDev'
  ]);

  grunt.registerTask('node-debug', [
    'node-inspector:dev'
  ]);
};
