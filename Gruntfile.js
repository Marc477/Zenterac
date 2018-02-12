module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: ['src/header.js', 'src/main.js', 'src/utils/*.js', 'src/**/*.js', '!src/doc/**'],
        dest: 'dist/<%= pkg.name %>.dev.js'
      },
      distcss: {
        src: ['lib/**/*.css', 'src/**/*.css', '!src/doc/**'],
        dest: 'dist/<%= pkg.name %>.dev.css'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    cssmin: {
        dist: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            }, 
            files: {
                'dist/<%= pkg.name %>.css': ['<%= concat.distcss.dest %>']
            }
        }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['src/**/*.js', '!src/doc/**', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    jsdoc : {
        dist : {
            src: ['src/*.js', 'src/controls/*.js', 'src/modules/*.js', 'src/utils/*.js'],
            options: {
                destination: 'doc',
                template : "src/doc/template",
                configure : "src/doc/template/jsdoc.conf"
            }
        }
    },
    copy: {
      main: {
        files: [ {expand: true, flatten: true, src: ['src/doc/tutorial/*'], dest: 'doc/'} ],
      },
    },
    clean: ["dist/*", "doc/*", "test/*"]
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');
  
  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('doc', ['jshint', 'jsdoc', 'copy']);
  grunt.registerTask('build', ['jshint', 'concat', 'uglify', 'cssmin']);
  
  grunt.registerTask('default', 'build', 'doc');

};