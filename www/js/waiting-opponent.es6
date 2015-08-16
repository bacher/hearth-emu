
new Screen({
    gClass: 'w',
    name: 'waiting-opponent',
    hash: '',
    draw: function() {
        render($app, 'waiting-opponent');

        const $anim = $app.find('.animation');
        var step = 1;

        this.intervalId = setInterval(function() {
            $anim.removeClass('s' + step);
            step++;

            if (step > 5) {
                step = 0;
            }

            $anim.addClass('s' + step);
        }, 100);

        window.socket = new WebSocket('ws://localhost:8081/');

        socket.onopen = () => {

            const deck = JSON.parse(window.localStorage.getItem('decks'))[0];
            send('join', {
                name: window.location.search.match(/[?&]name=([^&]*)/)[1],
                deck: {
                    clas: hbe.CLASSES[deck.clas],
                    cards: deck.cards
                }
            });
        };

        socket.onclose = event => {
            if (event.wasClean) {
                console.log('Соединение закрыто чисто');
            } else {
                console.log('Обрыв соединения');
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
                    hbe.activateScreen('battle');
                    break;

                case 'game-data':
                    hbe.battleData = data.data;
                    updateInGameData();
                    break;
            }
        };

        $app.on('click', '.cancel', () => {
            socket.close();
            hbe.activateScreen('main-menu');
        });
    },

    destroy: function() {
        clearInterval(this.intervalId);
    }
});
