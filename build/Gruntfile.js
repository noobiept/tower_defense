var PATH = require( 'path' );

module.exports = function( grunt )
{
var dest = '../release/<%= pkg.name %> <%= pkg.version %>/';

grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),

            // delete the destination folder
        clean: {
            options: {
                force: true
            },
            release: [
                dest
            ]
        },

            // copy the audio and libraries files
        copy: {
            release: {
                expand: true,
                cwd: '../',
                src: [
                    'images/*.png',
                    'libraries/*.js',
                    'maps/*.json'
                ],
                dest: dest
            }
        },

        uglify: {
            release: {
                files: {
                    '../release/<%= pkg.name %> <%= pkg.version %>/min.js': [
                            // the order matters, since some classes inherit from others, so the base ones need to be defined first
                            // this is based on the order in index.html
                        '../scripts/path_finding.js',
                        '../scripts/bullet.js',
                        '../scripts/tower.js',
                        '../scripts/tower_fast.js',
                        '../scripts/tower_rocket.js',
                        '../scripts/tower_frost.js',
                        '../scripts/tower_anti_air.js',
                        '../scripts/tower_bash.js',
                        '../scripts/unit.js',
                        '../scripts/unit_group.js',
                        '../scripts/unit_fly.js',
                        '../scripts/unit_fast.js',
                        '../scripts/unit_spawn.js',
                        '../scripts/unit_immune.js',
                        '../scripts/game.js',
                        '../scripts/game_menu.js',
                        '../scripts/main_menu.js',
                        '../scripts/message.js',
                        '../scripts/tooltip.js',
                        '../scripts/high_score.js',
                        '../scripts/map.js',
                        '../scripts/main.js'
                    ]
                }
            }
        },

        cssmin: {
            release: {
                files: [{
                    expand: true,
                    cwd: '../css/',
                    src: 'style.css',
                    dest: PATH.join( dest, 'css' )
                }]
            }
        },

        processhtml: {
            release: {
                files: [{
                    expand: true,
                    cwd: '../',
                    src: 'index.html',
                    dest: dest
                }]
            }
        }
    });

    // load the plugins
grunt.loadNpmTasks( 'grunt-contrib-copy' );
grunt.loadNpmTasks( 'grunt-contrib-uglify' );
grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
grunt.loadNpmTasks( 'grunt-contrib-clean' );
grunt.loadNpmTasks( 'grunt-processhtml' );

    // tasks
grunt.registerTask( 'default', [ 'clean', 'copy', 'uglify', 'cssmin', 'processhtml' ] );
};