
const H = require('./namespace');

const E = {
    'play-card': {
        eventName: 'play-card',
        filterFunc: function(o, params, callback) {
            var allowPlayer;
            if (params[0] === 'my') {
                allowPlayer = o.player;
            } else if (params[0] === 'op') {
                allowPlayer = o.player.enemy;
            }

            return function(handCard) {
                if ((!allowPlayer || allowPlayer === handCard.player) && (!params[1] || handCard.base.type === params[1])) {
                    callback();
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

            return function(source, target) {
                if ((!minion || minion === target) &&
                    (!allowPlayer || allowPlayer === target.player) &&
                    (!allowHero || allowHero === target.player.hero)) {
                    callback();
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

            return function(source, target) {
                const targets = new H.Targets(source.player);
                targets.addMinion(target);

                if ((!minion || minion === source) && (!allowPlayer || allowPlayer === source.player)) {
                    callback(targets);
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
