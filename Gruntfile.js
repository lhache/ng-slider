/**
 * Grunt file
 *
 * Commands
 * grunt : does jshint, build and test
 * grunt server : launch the server
 * grunt build
 * grunt test
 *
 * @author Louis Hache
 */

'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    // configurable paths
    var config = {
        src: 'src',
        dist: 'dist',
        demo: 'demo'
    };



    grunt.initConfig({
        config: config,
        watch: {
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= config.demo %>/{,**}/*.html',
                    '.tmp/css/{,*/}*.css',
                    '{.tmp,<%= config.src %>}/{,**}/*.js',
                ]
            }
        },
        autoprefixer: {
            options: ['last 2 versions', 'ie 8'],
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },
        connect: {
            options: {
                port: 8000,
                hostname: 'localhost',
                debug : true,
                middleware: function (connect, options) {
                    var config = [
                        connect.static(options.base),
                        connect.directory(options.base)
                    ];
                    return config;
                }
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, config.src)
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, config.dist)
                        ];
                    }
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*',
                        'out'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= config.src %>/*.js',
            ]
        },
        less: {
            production: {
                options: {
                    cleancss: true,
                    ieCompat: true,
                    report: 'min'
                },
                files: {
                    // will create CSS file from less file
                    // TODO
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= config.dist %>/js/{,*/}*.js',
                        '<%= config.dist %>/css/{,*/}*.css',
                    ]
                }
            }
        },
        useminPrepare: {
            html: '<%= config.src %>/index.html',
            options: {
                dest: '<%= config.dist %>',
                flow: {
                    html: {
                        steps: {'js' : ['concat']},
                        post: {}
                    }
                }
            }
        },
        usemin: {
            //html: ['<%= config.dist %>/*.html'],
            //css: ['<%= config.dist %>/*.css'],
            options: {
                assetsDirs: ['<%= config.dist %>']
            }
        },
        htmlmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.src %>',
                    src: ['*.html'],
                    dest: '<%= config.dist %>'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.src %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '.htaccess',
                        'bower_components/**/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/img',
                    dest: '<%= config.dist %>/img',
                    src: [
                        'generated/*'
                    ]
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= config.src %>/css',
                dest: '.tmp/css/',
                src: '{,*/}*.css'
            }
        },
        concurrent: {
            server: [
                'copy:styles'
            ],
            test: [
                'copy:styles'
            ],
            dist: [
                'copy:styles',
                'htmlmin'
            ]
        },
        karma: {
            unit: {
                configFile: 'test/config/karma.conf.js',
                runnerPort: 9999,
                singleRun: true
            },
            e2e: {
                configFile: 'test/config/karma-e2e.conf.js',
                runnerPort: 9999,
                singleRun: true
            }
        },
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>/js',
                    src: '*.js',
                    dest: '<%= config.dist %>/js'
                }]
            }
        },
        concat: {
            dist: {
                options: {
                    // HOWTO: make jshint happy
                    // Replace all 'use strict' statements in the code with a single one at the top
                    banner: "'use strict';\n",
                    process: function(src, filepath) {
                        return '// Source: ' + filepath + '\n' +
                            src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                    }
                },
                src: ['<%= config.src %>/{,**/}*.js'],
                dest: '.tmp/concat/js/app.js'
            }
        },
        uglify: {
            dist: {
                options: {
                    mangle: false,
                    preserveComments: 'false',
                    report: 'min'
                },
                files: {
                    '<%= config.dist %>/js/app.js': [
                        '.tmp/concat/js/app.js'
                    ]
                }
            }
        }
    });


    grunt.registerTask('server', function (target) {
        // run => grunt server:dist
        if (target === 'dist') {
            return grunt.task.run([
                'build',
                'connect:dist:keepalive'
            ]);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            //'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        //'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        //'useminPrepare',
        //'less:production',
        'concurrent:dist',
        'concat',
        'uglify',
        //'autoprefixer',
        //'copy:dist',
        //'ngmin',
        //'rev',
        //'usemin'
    ]);

    grunt.registerTask('prepare', [
        'jshint',
        'build',
        //'test'
    ]);

};