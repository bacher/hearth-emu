
const H = require('./namespace');


H.Events = {
    'draw-card': function(player, params, callback) {

    },
    'play-card': function(player, params, callback) {
        const allowFrom = params[0] === 'my' ? player : player.enemy;

        return function(handCard) {
            if (allowFrom === handCard.player && handCard.base.type === params[1]) {
                callback.apply(null, arguments);
            }
        };
    }
};
