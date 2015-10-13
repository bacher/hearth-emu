
const H = require('./namespace');

const E = {
    'play-card': {
        eventName: 'play-card',
        filterFunc: function(o, params, callback) {
            var allowPlayer;
            var allowType = params[1];
            var allowCost = params[2];

            if (params[0] === 'my') {
                allowPlayer = o.player;
            } else if (params[0] === 'op') {
                allowPlayer = o.player.enemy;
            }

            return function(eventMessage) {
                const handCard = eventMessage.handCard;

                if ((!allowPlayer || allowPlayer === handCard.player) &&
                    (!allowType || handCard.base.type === allowType) &&
                    (!allowCost || handCard.base.cost === allowCost)) {
                    callback(eventMessage);
                }
            };
        }
    },
    'card-played': {
        eventName: 'card-played',
        filterFunc: function(o, params, callback) {
            var allowPlayer;
            var allowType = params[1];

            if (params[0] === 'my') {
                allowPlayer = o.player;
            } else if (params[0] === 'op') {
                allowPlayer = o.player.enemy;
            }

            return function(eventMessage) {
                const handCard = eventMessage.handCard;

                if ((!allowPlayer || allowPlayer === handCard.player) &&
                    (!allowType || handCard.base.type === allowType)) {

                    var targets = null;

                    if (eventMessage.minion) {
                        targets = H.Targets.createFromMinion(o.player, eventMessage.minion);
                    }

                    callback(eventMessage, targets);
                }
            };
        }
    },
    'summon': {
        eventName: 'summon',
        filterFunc: function(o, params, callback) {
            var allowPlayer;
            var attackLessThen;

            if (params[0] === 'my') {
                allowPlayer = o.player;
            } else if (params[0] === 'op') {
                allowPlayer = o.player.enemy;
            }

            const filter = params[1];
            var race;

            if (filter === 'attack3') {
                attackLessThen = 4;

            } else if (/^race-/.test(filter)) {
                race = H.RACES[filter.substr(5)];
            }

            const flags = params[2];

            return function(eventMessage) {
                const minion = eventMessage.minion;

                if (minion !== o.minion &&
                    (!allowPlayer || allowPlayer === minion.player) &&
                    (!attackLessThen || minion.attack < attackLessThen) &&
                    (!race || minion.race === race) &&
                    (!flags || minion.is(flags))) {

                    const targets = new H.Targets(o.player);
                    targets.addMinion(minion);

                    callback(eventMessage, targets);
                }
            };
        }
    },
    'take-damage': {
        eventName: 'deal-damage',
        filterFunc: function(o, params, callback) {
            const target = params[0];
            var minion;
            var allowPlayer;
            var allowHero;
            var onlyMinions;

            if (target === 'self') {
                minion = o.minion;
            } else if (target === 'my') {
                allowPlayer = o.player;
            } else if (target === 'op') {
                allowPlayer = o.player.enemy;
            } else if (target === 'my-hero') {
                allowHero = o.player.hero;
            } else if (target === 'minions') {
                onlyMinions = true;
            } else if (target === 'my-minions') {
                allowPlayer = o.player;
                onlyMinions = true;
            }

            return function(eventMessage) {
                if ((!minion || minion === eventMessage.to) &&
                    (!allowPlayer || allowPlayer === eventMessage.to.player) &&
                    (!allowHero || allowHero === eventMessage.to) &&
                    (!onlyMinions || eventMessage.to.objType === 'minion')) {

                    callback(eventMessage);
                }
            };
        }
    },
    'damage-taken': {
        eventName: 'damage-dealt',
        filterFunc: function(o, params, callback) {
            const target = params[0];
            const isAlive = params[1] === 'alive';

            var minion;
            var allowPlayer;
            var allowHero;
            var onlyMinions;

            if (target === 'self') {
                minion = o.minion;
            } else if (target === 'my') {
                allowPlayer = o.player;
            } else if (target === 'op') {
                allowPlayer = o.player.enemy;
            } else if (target === 'my-hero') {
                allowHero = o.player.hero;
            } else if (target === 'minions') {
                onlyMinions = true;
            } else if (target === 'my-minions') {
                allowPlayer = o.player;
                onlyMinions = true;
            }

            return function(eventMessage) {
                if ((!minion || minion === eventMessage.to) &&
                    (!allowPlayer || allowPlayer === eventMessage.to.player) &&
                    (!allowHero || allowHero === eventMessage.to) &&
                    (!onlyMinions || eventMessage.to.objType === 'minion') &&
                    (!isAlive || !eventMessage.to.is('dead'))) {

                    callback(eventMessage);
                }
            };
        }
    },
    'hit-to': {
        eventName: 'hit',
        filterFunc: function(o, params, callback) {
            const target = params[0];
            var minion;
            var allowPlayer;
            var allowType;

            if (target === 'self') {
                minion = o.minion;
            } else if (target === 'my') {
                allowPlayer = o.player;
            } else if (target === 'op') {
                allowPlayer = o.player.enemy;
            } else if (target === 'my-hero') {
                minion = o.player.hero;
            } else if (target === 'my-minions') {
                allowPlayer = o.player;
                allowType = H.CARD_TYPES['minion'];
            }

            return function(eventMessage) {
                if ((!minion || minion === eventMessage.to) &&
                    (!allowPlayer || allowPlayer === eventMessage.to.player) &&
                    (!allowType || (eventMessage.to.card && eventMessage.to.card.type === allowType))) {

                    const targets = new H.Targets(eventMessage.to.player);
                    targets.addMinion(eventMessage.by);

                    callback(eventMessage, targets);
                }
            };
        }
    },
    'try-hit-to': {
        eventName: 'try-hit',
        filterFunc(o, params, callback) {
            const target = params[0];
            var minion;
            var allowPlayer;
            var allowType;

            if (target === 'self') {
                minion = o.minion;
            } else if (target === 'my') {
                allowPlayer = o.player;
            } else if (target === 'op') {
                allowPlayer = o.player.enemy;
            } else if (target === 'my-hero') {
                minion = o.player.hero;
            } else if (target === 'my-minions') {
                allowPlayer = o.player;
                allowType = H.CARD_TYPES['minion'];
            }

            return function(eventMessage) {
                if ((!minion || minion === eventMessage.to) &&
                    (!allowPlayer || allowPlayer === eventMessage.to.player) &&
                    (!allowType || (eventMessage.to.card && eventMessage.to.card.type === allowType))) {

                    const targets = new H.Targets(eventMessage.to.player);
                    targets.addMinion(eventMessage.by);

                    callback(eventMessage, targets);

                    if (eventMessage.by.is('detached')) {
                        eventMessage.prevent = true;
                    }
                }
            };
        }
    },
    'hit-by': {
        eventName: 'hit',
        filterFunc: function(o, params, callback) {
            const target = params[0];
            var minion;
            var allowPlayer;
            var allowHero;

            if (target === 'self') {
                minion = o.minion;
            } else if (target === 'my') {
                allowPlayer = o.player;
            } else if (target === 'op') {
                allowPlayer = o.player.enemy;
            } else if (target === 'my-hero') {
                allowHero = o.player.hero;
            }

            return function(eventMessage) {
                const targets = new H.Targets(eventMessage.by.player);
                targets.addMinion(eventMessage.to);

                if ((!minion || minion === eventMessage.by) && (!allowPlayer || allowPlayer === eventMessage.by.player) &&
                    (!allowHero || allowHero === eventMessage.by)) {
                    callback(eventMessage, targets);
                }
            };
        }
    },
    'heal': {
        eventName: 'heal',
        filterFunc(o, params, callback) {
            var isMinionsOnly = false;
            var targetMinion;

            const side = params[0];

            if (side === 'minion') {
                isMinionsOnly = true;
            } else if (side === 'self') {
                targetMinion = o.minion;
            }

            return function(eventMessage) {
                if (!isMinionsOnly || eventMessage.objType === 'minion' &&
                    !targetMinion || targetMinion === eventMessage) {
                    callback(eventMessage);
                }
            };
        }
    },
    'will-die': {
        eventName: 'deal-damage',
        filterFunc: function(o, params, callback) {
            const target = params[0];
            var minion;
            var allowHero;

            if (target === 'self') {
                minion = o.minion;

            } else if (target === 'my-hero') {
                allowHero = o.player.hero;
            }

            return function(eventMessage) {
                if (eventMessage.willDie &&
                    (!minion || minion === eventMessage.to) &&
                    (!allowHero || allowHero === eventMessage.to)) {
                    callback(eventMessage);
                }
            };
        }
    },
    'start-turn': {
        eventName: 'start-turn',
        filterFunc(o, params, callback) {
            const side = params[0];

            var playerSide = null;

            if (side === 'my') {
                playerSide = o.player;
            } else if (side === 'op') {
                playerSide = o.player.enemy;
            }

            return function(player) {
                if (!playerSide || playerSide === player) {
                    callback.apply(null, arguments);
                }
            };
        }
    },
    'end-turn': {
        eventName: 'end-turn',
        filterFunc(o, params, callback) {
            const side = params[0];

            var playerSide = null;

            if (side === 'my') {
                playerSide = o.player;
            } else if (side === 'op') {
                playerSide = o.player.enemy;
            }

            return function(player) {
                if (!playerSide || playerSide === player) {
                    callback.apply(null, arguments);
                }
            };
        }
    },
    'death': {
        eventName: 'death',
        filterFunc(o, params, callback) {
            const side = params[0];
            const raceFilter = H.RACES[params[1]];

            var playerSide = null;
            var targetMinion = null;

            if (side === 'my') {
                playerSide = o.player;
            } else if (side === 'op') {
                playerSide = o.player.enemy;
            } else if (side === 'self') {
                targetMinion = o.minion;
            }

            return function(minion) {
                if (!playerSide || playerSide === minion.player &&
                    !targetMinion || targetMinion === minion &&
                    !raceFilter || minion.race === raceFilter) {

                    const targets = H.Targets.createFromMinion(o.player, minion);

                    callback(minion, targets);
                }
            };
        }
    },
    'play-secret': {
        eventName: 'play-secret',
        filterFunc(o, params, callback) {
            const side = params[0];
            var playerSide;

            if (side === 'my') {
                playerSide = o.player;
            } else if (side === 'op') {
                playerSide = o.player.enemy;
            }

            return function(eventMessage) {
                if (!playerSide || playerSide === eventMessage) {
                    callback(eventMessage);
                }
            };
        }
    },
    'draw-card': {
        eventName: 'draw-card',
        filterFunc(o, params, callback) {
            const side = params[0];
            var playerSide;

            if (side === 'my') {
                playerSide = o.player;
            } else if (side === 'op') {
                playerSide = o.player.enemy;
            }

            return function(eventMessage) {
                if (!playerSide || playerSide === eventMessage.player) {
                    callback(eventMessage);
                }
            };
        }
    },
    'use-hero-skill': {
        eventName: 'use-hero-skill',
        filterFunc(o, params, callback) {
            const side = params[0];
            var playerSide;

            if (side === 'my') {
                playerSide = o.player;
            } else if (side === 'op') {
                playerSide = o.player.enemy;
            }

            return function(eventMessage) {
                if (!playerSide || playerSide === eventMessage.player) {
                    callback(eventMessage);
                }
            };
        }
    }
};

H.EventFilters = {
    getCallback(event, o, callback) {
        const ev = E[event.name];

        return {
            eventName: ev.eventName,
            callback: ev.filterFunc(o, event.params, callback)
        };
    }
};
