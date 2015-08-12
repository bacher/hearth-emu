
var socket = null;

hbe.createWaitBattleScreen = () => {

    jade.render($('#app')[0], 'wait-for-battle', {});

    $('#app')
        .removeClass('b c')
        .addClass('w');

    socket = new WebSocket('ws://localhost:8081/');

    socket.onopen = () => {
        console.log('Соединение установлено');
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
        console.log('Получены данные', event.data);

        const data = JSON.parse(event.data);

        switch (data.msg) {
            case 'battle-started':
                break;

            case 'game-data':
                hbe.battleData = data.data;
                hbe.createBattleScreen();
                break;
        }
    };
};

hbe.createBattleScreen = () => {

    jade.render($('#app')[0], 'battle', {});

    $('#app')
        .removeClass('w c')
        .addClass('b');


    hbe.battleData.my.hand.cards.forEach(card => {
        var $container = $('<div>');

        jade.render($container[0], 'card', {
            img: 'cards/' + card.info.id + '.png',
            cid: card.cid
        });

        $('.hand.my').append($container.children());
    });

    $('#app')
        .on('click', '.hand.my .card', e => {
            var $card = $(e.currentTarget);

            $card.siblings().removeClass('selected');
            $card.addClass('selected');
        })
        .on('click', '.battleground', e => {
            var $card = $('.card.selected');

            if ($card.length) {
                socket.send(JSON.stringify({
                    msg: 'play-card',
                    data: {
                        cid: $card.data('cid')
                    }
                }));
            }
        });

};
