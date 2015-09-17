
const H = require('./namespace');

const E = {
    'play-card': {
        eventName: 'play-card',
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
                    callback(eventMessage);
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

            if (filter === 'attack3') {
                attackLessThen = 4;
            }

            return function(eventMessage) {
                const minion = eventMessage.minion;

                if ((!allowPlayer || allowPlayer === minion.player) &&
                    (!attackLessThen || minion.attack < attackLessThen)) {

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
                if ((!minion || minion === eventMessage.to) &&
                    (!allowPlayer || allowPlayer === eventMessage.to.player) &&
                    (!allowHero || allowHero === eventMessage.to)) {
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
    'hit-by': {
        eventName: 'hit',
        filterFunc: function(o, params, callback) {
            const target = params[0];
            var minion;
            var allowPlayer;

            if (target === 'self') {
                minion = o.minion;
            } else if (target === 'my') {
                allowPlayer = o.player;
            } else if (target === 'op') {
                allowPlayer = o.player.enemy;
            }

            return function(eventMessage) {
                const targets = new H.Targets(eventMessage.by.player);
                targets.addMinion(eventMessage.to);

                if ((!minion || minion === eventMessage.by) && (!allowPlayer || allowPlayer === eventMessage.by.player)) {
                    callback(eventMessage, targets);
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

            if (side === 'own') {
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

            if (side === 'own') {
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
