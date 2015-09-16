
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

                if ((!allowPlayer || allowPlayer === handCard.player) && (!allowType || handCard.base.type === allowType)) {
                    callback(eventMessage);
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
