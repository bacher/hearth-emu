
const hbe = {

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

hbe.screens = [];
hbe.activeScreen = null;

hbe.activateScreen = function(name) {
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

function send(msg, data) {
    const packet = { msg, data: data || null };

    console.log('Client Message:', packet);

    socket.send(JSON.stringify(packet));
}

function render($cont, tmplName, params) {
    try {
        jade.render($cont[0], tmplName, params || {});
    } catch(e) {
        debugger;
        throw e;
    }
}
