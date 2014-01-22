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
        '<%= confs.site %>/assets/SHA1.js',
        '<%= confs.site %>/assets/bencoding.js'
      ],
      options: {
        specs: [
          '<%= confs.siteSpec %>/SHA1.js',
          '<%= confs.siteSpec %>/bencoding.js'
        ]
      }
    },
    connect: {
      server: {
        options: {
          port: '<%= confs.frontEndServerPort %>',
          keepalive: true,
          base: '<%= confs.site %>'
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
      express: {
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

  // Default tasks (when type grunt on terminal).
  grunt.registerTask('default', [
    'jshint',
    'jasmine',
    'watch:feDev'
    //XXX try to deal with a 'magic' whole file // 'connect'
    //'uglify'
  ]);

  grunt.registerTask('server', [
    'jshint',
    'express:dev',
    'watch'
  ]);
};
