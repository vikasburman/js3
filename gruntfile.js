module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('bower.json'),
	
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
	
	copy: {
		main: {
			files: [{
				src: 'src/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.core.js'
			}]
		}
	},
	
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - <%= pkg.title %>  \n' +
				' *  Version <%= pkg.version %> (Build <%= grunt.template.today("dd-mm-yyyy") %>) \n' +
				' *  <%= pkg.copyright %> \n' + 
				' * \n' + 
				' *  Project: https://github.com/vikasburman/js3 \n' +
				' *  License: https://raw.github.com/vikasburman/js3/master/LICENSE.md \n' +
				' *  Commercial: http://www.vikasburman.com/js3 \n' + 
				' */ \n'
      },
	  
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>'],
          'dist/<%= pkg.name %>.core.min.js': ['<%= copy.main.files[0].dest %>']
        }
      }
    },
	
    jshint: {
		files: ['gruntfile.js', 'src/**/*.js'],
		options: {
			white: false,
			smarttabs: true,
			plusplus: true,
			bitwise: true,
			globals: {
				window: false
			}		  
		}
	}
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['jshint', 'copy', 'concat', 'uglify']);
};