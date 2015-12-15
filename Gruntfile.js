module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            scripts: ['assets/js/scripts.js', 'assets/js/scripts.min.js'],
            styles: ['assets/css/styles.css', 'assets/css/styles.min.css']
        },

        // Concats all javascript and SASS
        concat: {
            scripts: {
                src: ['assets/js/src/*.js'],
                dest: 'assets/js/scripts.js'
            }
        },

        // Minifies javascript
        uglify: {
            scripts: {
                src: 'assets/js/scripts.js',
                dest: 'assets/js/scripts.min.js'
            }
        },

        // Converts SASS to CSS
        sass: {
            dist: {
                options: {
                    style: 'expanded',
                    cacheLocation: 'assets/css/.sass-cache'
                },
                files: {
                    'assets/css/styles.css': 'assets/css/styles.scss'
                }
            }
        },

        // Watch for changes and restart node
        nodemon: {
            dev: {
                script: 'app.js',
                options: {
                    ext: 'js,hbs'
                }
            }
        },

        // Applies vendor prefixes to CSS
        autoprefixer: {
            options: {
                browsers: ['last 2 version', 'ie 9']
            },
            no_dest: {
                src: ['assets/css/styles.css']
            }
        },

        // Minifies CSS
        cssmin: {
            minify: {
                expand: true,
                cwd: 'assets/css',
                src: ['styles.css'],
                dest: 'assets/css',
                ext: '.min.css'
            }
        },

        // Watch command
        watch: {
            scripts: {
                files: 'assets/js/src/*.js',
                tasks: ['dist-scripts'],
                options: {
                    livereload: true
                }
            },
            styles: {
                files: ['assets/css/**/*.scss'],
                tasks: ['dist-styles'],
                options: {
                    livereload: true
                }
            }
        },

        concurrent: {
            dev: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    // Loads grunt dependencies
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');

    // Scripts distribution task
    grunt.registerTask('dist-scripts', ['clean:scripts', 'concat:scripts', 'uglify:scripts']);

    // Styles distribution task
    grunt.registerTask('dist-styles', ['clean:styles', 'sass', 'autoprefixer', 'cssmin']);

    // Full distribution task
    grunt.registerTask('dist', ['dist-scripts', 'dist-styles']);

    // Default grunt task
    // grunt.registerTask('default', ['dist', 'watch']);
    grunt.registerTask('default', ['dist', 'concurrent']);

};
