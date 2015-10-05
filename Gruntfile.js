
module.exports = function(grunt) {
    grunt.initConfig({
        sprite: {
            all: {
                src: 'www/textures/sprites/*.png',
                dest: 'www/textures/deck_my.png',
                destCss: 'www/styles/sprites.css'
            }
        },
        less: {
            dev: {
                files: {
                    'www/styles/compiled.css': 'www/styles/compile.less'
                }
            }
        },
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "server/abilities.js": "server/abilities.es6",
                    "server/activations.js": "server/activations.es6",
                    "server/basic-decks.js": "server/basic-decks.es6",
                    "server/cards.js": "server/cards.es6",
                    "server/classes/aura.js": "server/classes/aura.es6",
                    "server/classes/auras.js": "server/classes/auras.es6",
                    "server/classes/battle.js": "server/classes/battle.es6",
                    "server/classes/card.js": "server/classes/card.es6",
                    "server/classes/command.js": "server/classes/command.es6",
                    "server/classes/commands.js": "server/classes/commands.es6",
                    "server/classes/creatures.js": "server/classes/creatures.es6",
                    "server/classes/deck.js": "server/classes/deck.es6",
                    "server/classes/game-object.js": "server/classes/game-object.es6",
                    "server/classes/hand-card.js": "server/classes/hand-card.es6",
                    "server/classes/hand.js": "server/classes/hand.es6",
                    "server/classes/hero-skill.js": "server/classes/hero-skill.es6",
                    "server/classes/hero.js": "server/classes/hero.es6",
                    "server/classes/heroes/druid.js": "server/classes/heroes/druid.es6",
                    "server/classes/heroes/hunter.js": "server/classes/heroes/hunter.es6",
                    "server/classes/heroes/mage.js": "server/classes/heroes/mage.es6",
                    "server/classes/heroes/paladin.js": "server/classes/heroes/paladin.es6",
                    "server/classes/heroes/priest.js": "server/classes/heroes/priest.es6",
                    "server/classes/heroes/rogue.js": "server/classes/heroes/rogue.es6",
                    "server/classes/heroes/shaman.js": "server/classes/heroes/shaman.es6",
                    "server/classes/heroes/warlock.js": "server/classes/heroes/warlock.es6",
                    "server/classes/heroes/warrior.js": "server/classes/heroes/warrior.es6",
                    "server/classes/minion.js": "server/classes/minion.es6",
                    "server/classes/player.js": "server/classes/player.es6",
                    "server/classes/targets.js": "server/classes/targets.es6",
                    "server/classes/trap.js": "server/classes/trap.es6",
                    "server/classes/traps.js": "server/classes/traps.es6",
                    "server/classes/weapon.js": "server/classes/weapon.es6",
                    "server/conditions.js": "server/conditions.es6",
                    "server/constants.js": "server/constants.es6",
                    "server/custom-actions.js": "server/custom-actions.es6",
                    "server/daemon.js": "server/daemon.es6",
                    "server/event-filters.js": "server/event-filters.es6",
                    "server/game.js": "server/game.es6",
                    "server/namespace.js": "server/namespace.es6",
                    "server/server.js": "server/server.es6",
                    "server/targets.js": "server/targets.es6",
                    "server/utils.js": "server/utils.es6",
                    "www/js/classes/application.js": "www/js/classes/application.es6",
                    "www/js/classes/screen.js": "www/js/classes/screen.es6",
                    "www/js/classes/socket.js": "www/js/classes/socket.es6",
                    "www/js/core.js": "www/js/core.es6",
                    "www/js/index.js": "www/js/index.es6",
                    "www/screens/battle/animations/animations.js": "www/screens/battle/animations/animations.es6",
                    "www/screens/battle/battle.js": "www/screens/battle/battle.es6",
                    "www/screens/battle/chat/chat.js": "www/screens/battle/chat/chat.es6",
                    "www/screens/battle/creatures/creatures.js": "www/screens/battle/creatures/creatures.es6",
                    "www/screens/battle/hand/hand.js": "www/screens/battle/hand/hand.es6",
                    "www/screens/battle/play-card.js": "www/screens/battle/play-card.es6",
                    "www/screens/battle-end/battle-end.js": "www/screens/battle-end/battle-end.es6",
                    "www/screens/battle-welcome/battle-welcome.js": "www/screens/battle-welcome/battle-welcome.es6",
                    "www/screens/choose-card/choose-card.js": "www/screens/choose-card/choose-card.es6",
                    "www/screens/choose-hero-deck/choose-hero-deck.js": "www/screens/choose-hero-deck/choose-hero-deck.es6",
                    "www/screens/collection/collection.js": "www/screens/collection/collection.es6",
                    "www/screens/collection-deck/collection-deck.js": "www/screens/collection-deck/collection-deck.es6",
                    "www/screens/collection-decks/collection-decks.js": "www/screens/collection-decks/collection-decks.es6",
                    "www/screens/connection-lost/connection-lost.js": "www/screens/connection-lost/connection-lost.es6",
                    "www/screens/game-menu/game-menu.js": "www/screens/game-menu/game-menu.es6",
                    "www/screens/loading/loading.js": "www/screens/loading/loading.es6",
                    "www/screens/main-menu/main-menu.js": "www/screens/main-menu/main-menu.es6",
                    "www/screens/options/options.js": "www/screens/options/options.es6",
                    "www/screens/start-game-menu/start-game-menu.js": "www/screens/start-game-menu/start-game-menu.es6",
                    "www/screens/waiting-opponent/waiting-opponent.js": "www/screens/waiting-opponent/waiting-opponent.es6"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-babel');

    //grunt.registerTask('default', ['babel']);
};
