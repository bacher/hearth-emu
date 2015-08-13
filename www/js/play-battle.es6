
var socket = null;

hbe.createWaitBattleScreen = () => {

    jade.render($('#app')[0], 'wait-for-battle', {});

    $('#app')
        .removeClass('b c')
        .addClass('w');

    socket = new WebSocket('ws://localhost:8081/');

    socket.onopen = () => {
        console.log('Соединение установлено');

        socket.send(JSON.stringify({
            msg: 'join',
            data: {
                name: window.location.search.match(/[?&]name=([^&]*)/)[1]
            }
        }));
    };

    socket.onclose = event => {
        if (event.wasClean) {
            console.log('Соединение закрыто чисто');
        } else {
            console.log('Обрыв соединения'); // например, "убит" процесс сервера
        }
        console.log('Код: ' + event.code + ' причина: ' + event.reason);
    };

    socket.onerror = error => {
        console.log('Ошибка', error.message);
    };

    socket.onmessage = event => {

        const data = JSON.parse(event.data);

        console.log('Server Message:', data);

        switch (data.msg) {
            case 'battle-started':
                break;

            case 'game-data':
                hbe.createBattleScreen();
                hbe.battleData = data.data;
                updateInGameData();
                break;
        }
    };
};

hbe.createBattleScreen = () => {

    jade.render($('#app')[0], 'battle', {});

    $('#app')
        .removeClass('w c')
        .addClass('b');

    $('#app')
        .on('click', '.hand.my .card', e => {
            if (hbe.battleData.my.active) {
                var $card = $(e.currentTarget);

                $card.siblings().removeClass('selected');
                $card.addClass('selected');
            }
        })
        .on('click', '.battleground', e => {
            if (hbe.battleData.my.active) {
                var $card = $('.card.selected');

                if ($card.length) {
                    socket.send(JSON.stringify({
                        msg: 'play-card',
                        data: {
                            cid: $card.data('cid')
                        }
                    }));
                }
            }
        })
        .on('click', '.end-turn', () => {
            console.log('END-TURN');
            if (hbe.battleData.my.active) {
                socket.send(JSON.stringify({
                    msg: 'end-turn'
                }));
            }
        });
};

function updateInGameData() {
    const game = hbe.battleData;

    $('.name.op').text(game.op.name);
    $('.name.my').text(game.my.name);

    const $hand = $('.hand.my').empty();
    const $handOp = $('.hand.op').empty();

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

        const $minions = $('.minions.' + side);

        game[side].minions.minions.forEach(minion => {
            var $container = $('<div>');

            jade.render($container[0], 'minion', minion);

            $minions.append($container.children());
        });

        $('.avatar.' + side + ' .health .value').text(hero.hp);

        $('.stats.' + side + ' .mana .active').text(hero.mana);
        $('.stats.' + side + ' .mana .all').text(hero.crystals);
    });

    $('.end-turn').toggleClass('active', game.my.active);

}
