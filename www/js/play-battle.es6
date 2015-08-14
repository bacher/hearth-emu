
var socket = null;

const $app = $('#app');

function send(msg, data) {
    const packet = { msg, data: data || null };

    console.log('Client Message:', packet);

    socket.send(JSON.stringify(packet));
}

hbe.createWaitBattleScreen = () => {

    jade.render($app[0], 'wait-for-battle', {});

    $app
        .removeClass('b c')
        .addClass('w');

    socket = new WebSocket('ws://localhost:8081/');

    socket.onopen = () => {
        send('join', {
            name: window.location.search.match(/[?&]name=([^&]*)/)[1]
        });
    };

    socket.onclose = event => {
        if (event.wasClean) {
            console.log('Соединение закрыто чисто');
        } else {
            console.log('Обрыв соединения'); // например, "убит" процесс сервера
        }
        console.warn('Code: ' + event.code + ' Cause: ' + event.reason);
    };

    socket.onerror = error => {
        console.warn('Socket Error', error.message);
    };

    socket.onmessage = event => {

        const data = JSON.parse(event.data);

        console.log('Server Message:', data);

        switch (data.msg) {
            case 'battle-started':
                hbe.createBattleScreen();
                break;

            case 'game-data':
                hbe.battleData = data.data;
                updateInGameData();
                break;
        }
    };
};

hbe.createBattleScreen = () => {

    jade.render($app[0], 'battle', {});

    $app
        .removeClass('w c')
        .addClass('b');

    $app
        .on('click', '.hand.my .card', e => {
            if (hbe.battleData.my.active) {
                const $card = $(e.currentTarget);

                $('.selected').removeClass('selected');
                $card.addClass('selected');
            }
        })
        .on('click', '.creatures.op .creature', e => {

            if (hbe.battleData.my.active) {
                const $myCreature = $('.creatures.my .creature.selected');

                if ($myCreature.length) {
                    const $enemyCreature = $(e.currentTarget);

                    send('hit-creature', {
                        my: $myCreature.data('crid'),
                        op: $enemyCreature.data('crid')
                    });
                }

            }

        })
        .on('click', '.battleground', e => {
            if (hbe.battleData.my.active) {
                const $card = $('.card.selected');

                if ($card.length) {
                    send('play-card', {
                        cid: $card.data('cid')
                    });
                }
            }
        })
        .on('click', '.end-turn', () => {
            if (hbe.battleData.my.active) {
                send('end-turn');
            }
        })
        .on('click', '.creatures.my .creature', e => {
            if (hbe.battleData.my.active) {
                var $creature = $(e.currentTarget);

                $('.selected').removeClass('selected');
                $creature.addClass('selected');
            }
        })
        .on('click', '.avatar.op', () => {
            if (hbe.battleData.my.active) {

                const $myCreature = $('.creatures.my .creature.selected');

                if ($myCreature.length) {
                    send('hit-hero', {
                        my: $myCreature.data('crid')
                    });
                }
            }
        });

};

function updateInGameData() {
    const game = hbe.battleData;

    $('.name.op').text(game.op.name);
    $('.name.my').text(game.my.name);

    if (!game.my.active) {
        $('.selected').removeClass('selected');
    }

    const $hand = $('.hand.my').empty();
    const $handOp = $('.hand.op').empty();

    $('.creatures').empty();

    game.my.hand.cards.forEach(card => {
        var $container = $('<div>');

        jade.render($container[0], 'card', {
            img: 'cards/' + card.info.id + '.png',
            cid: card.cid
        });

        $hand.append($container.children());
    });

    var $container = $('<div>');
    jade.render($container[0], 'card', {
        img: 'cards/card_back.png',
        cid: 0
    });

    for (var i = 0; i < game.op.hand.cards.length; ++i) {
        $handOp.append($container.children().clone());
    }

    ['my', 'op'].forEach(side => {
        const hero = game[side].hero;

        const $creatures = $('.creatures.' + side);

        game[side].creatures.forEach(minion => {
            var $container = $('<div>');

            jade.render($container[0], 'creature', minion);

            $creatures.append($container.children());
        });

        $('.avatar.' + side + ' .health .value').text(hero.hp);

        $('.stats.' + side + ' .mana .active').text(hero.mana);
        $('.stats.' + side + ' .mana .all').text(hero.crystals);
    });

    $('.end-turn').toggleClass('active', game.my.active);

}
