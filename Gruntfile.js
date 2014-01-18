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
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: [
          'SHA1.js',
          'randomness.js',
          'bencoding.js'
        ]
      },
      test: {
        src: ['spec/**.js']
      }
    },
    jasmine: {
      src: [
        'SHA1.js',
        'bencoding.js'
      ],
      options: {
        specs: [
          'spec/SHA1.js',
          'spec/bencoding.js'
        ]
      }
    }//,
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
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default tasks (when type grunt on terminal).
  grunt.registerTask('default', [
    'jshint',
    'jasmine',
    //'uglify'
  ]);
};
