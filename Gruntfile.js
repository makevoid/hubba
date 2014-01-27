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
      siteSpec: 'spec/www',
      appSpec: 'spec/app',
      site: 'src/www',
      app: 'src/srv',
      frontEndServerPort: 8000,
      backEndServerPort: 3000
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
          'spec/RTCPeerConnection.js',

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
    jasmine: {
      src: [
        '<%= confs.site %>/assets/index.js'
      ],
      options: {
        vendor: [
          'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.9/angular.min.js',
          'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.9/angular-mocks.js'
        ],
        helpers: [
          'spec/RTCPeerConnection.js'
        ],
        specs: [
          '<%= confs.siteSpec %>/SHA1.js'/*,
          '<%= confs.siteSpec %>/bencoding.js'*/
        ]
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
          'jasmine'
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
    //,
    //uglify: {
    //  options: {
    //    report: 'gzip',
    //    banner: banner
    //  },
    //  minifyTarget: {
    //    files: {
    //      'dist/hubba.min.js': [
    //        'first.js',
    //        'second.js'
    //        ]
    //    }
    //  }
    //}
  });

  // NPM Tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-node-inspector');

  // Default tasks (when type grunt on terminal).
  grunt.registerTask('default', [
    'jshint',
    'jasmine',
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
