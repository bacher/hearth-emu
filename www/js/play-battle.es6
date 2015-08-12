
hbe.createWaitBattleScreen = () => {

    jade.render($('#app')[0], 'wait-for-battle', {});

    $('#app')
        .removeClass('b c')
        .addClass('w');

    const socket = new WebSocket('ws://localhost:8081/');

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
};
