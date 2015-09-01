
const H = {

    CLASSES: {
        neutral: 0,
        warrior: 1,
        shaman: 2,
        rogue: 3,
        paladin: 4,
        hunter: 5,
        druid: 6,
        warlock: 7,
        mage: 8,
        priest: 9
    },

    CLASSES_L: [
        'neutral',
        'warrior',
        'shaman',
        'rogue',
        'paladin',
        'hunter',
        'druid',
        'warlock',
        'mage',
        'priest'
    ],

    CARD_TYPES: {
        minion: 1,
        spell: 2,
        weapon: 3,
        trap: 4
    },

    CARD_TYPES_L: [
        null,
        'minion',
        'spell',
        'weapon',
        'trap'
    ]
};

H.screens = [];
H.activeScreen = null;

H.activateScreen = function(name) {
    var setScreen = null;
    this.screens.some(screen => {
        if (screen.name === name) {
            setScreen = screen;
            return true;
        }
    });

    if (setScreen) {
        if (this.activeScreen) {
            this.activeScreen.destroy();
        }

        this.activeScreen = setScreen;

        this.activeScreen.draw();
    }
};

H.checkParam = function(string) {
    return new RegExp('[?&]' + string + '(?:&|$)').test(window.location.search);
};

function send(msg, data) {
    const packet = { msg, data: data || null };

    console.log('Client Message:', packet);

    H.socket.send(JSON.stringify(packet));
}

function render($cont, tmplName, params) {
    try {
        jade.render($cont[0], tmplName, params || {});
    } catch(e) {
        /* jshint debug:true */
        debugger;
        throw e;
    }
}

if (H.checkParam('cursor')) {
    const $cursor = $('<div>').addClass('cursor').appendTo('BODY');

    $('BODY')
        .css('cursor', 'none')
        .on('mousemove', e => {
            $cursor.css({
                top: e.pageY - 4,
                left: e.pageX - 15
            });
        })
        .on('mousedown', () => {
            $cursor.addClass('down');
        })
        .on('mouseup', () => {
            $cursor.removeClass('down');
        });
}
