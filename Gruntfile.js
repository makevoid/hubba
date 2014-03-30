'use strict';

module.exports = function (grunt) {

//  var banner = ['/*!',
//    ' * Hubba v<%= pkg.version %>',
//    ' *',
//    ' * Released under the GPL-2.0 license',
//    ' * http://opensource.org/licenses/GPL-2.0',
//    ' *',
//    ' * <%= grunt.template.today("yyyy-mm-dd") %>',
//    ' */\n\n'
//  ].join('\n');

  var nodemonCallBack = function (nodemon) {
      nodemon.on('log', function (event) {

        process.stdout.write(event.colour + '\r\n');
      });

      nodemon.on('restart', function(files) {

        process.stdout.write('Hubba restart due ' + files + ' trigger restart\r\n');
      });

      nodemon.on('exit', function () {

        process.stdout.write('Hubba exited correctly' + '\r\n');
      });
    };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    confs: {
      siteSpec: 'spec/www',
      appSpec: 'spec/srv',
      site: 'src/www',
      app: 'src/srv',
      frontEndServerPort: 8000,
      backEndServerPort: 3000,
      backEndWebSocketPort: 3117
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

          '<%= confs.site %>/assets/index.js'
        ]
      },
      test: {
        src: [
          '<%= confs.appSpec %>/**.js',

          '<%= confs.siteSpec %>/**.js'
        ]
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

          '<%= confs.siteSpec %>/SHA1.js',
          '<%= confs.siteSpec %>/BEncode.js'
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
    concurrent: {
      dev: {
        tasks: ['nodemon:dev', 'node-inspector:dev', 'watch:beDev'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: '<%= confs.app %>/index.js',
        options: {
          nodeArgs: ['--debug'],
          callback: nodemonCallBack,
          env: {
            HTTP_PORT: '<%= confs.backEndServerPort %>',
            WS_PORT: '<%= confs.backEndWebSocketPort %>'
          }
        }
      },
      prod: {
        script: '<%= confs.app %>/index.js',
        options: {
          callback: nodemonCallBack,
          env: {
            HTTP_PORT: '<%= confs.backEndServerPort %>',
            WS_PORT: '<%= confs.backEndWebSocketPort %>'
          }
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
          'jshint'
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

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-node-inspector');

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
    'concurrent:dev'
  ]);
};
