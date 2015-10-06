
module.exports = function(grunt) {
    grunt.initConfig({
        sprite: {
            all: {
                src: 'www/textures/sprites/*.png',
                dest: 'www/textures/deck_my.png',
                destCss: 'www/styles/sprites.css'
            }
        },
    });

    grunt.loadNpmTasks('grunt-spritesmith');
};
