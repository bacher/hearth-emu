
const H = require('./namespace');


H.Events = {
    'draw-card': function(player, params, callback) {

    },
    'play-card': function(player, params, callback) {
        var allowPlayer;
        if (params[0] === 'my') {
            allowPlayer = player;
        } else if (params[0] === 'op') {
            allowPlayer = player.enemy;
        }

        return function(handCard) {
            if ((!allowPlayer || allowPlayer === handCard.player) && (!params[1] || handCard.base.type === params[1])) {
                callback();
            }
        };
    }
};
