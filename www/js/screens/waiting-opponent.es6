
new H.Screen({
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

        H.socket = new WebSocket('ws://localhost:8081/');

        H.socket.onopen = () => {

            var name;
            const nameMatch = window.location.search.match(/[?&]name=([^&]*)/);

            if (nameMatch) {
                name = nameMatch[1];
            } else {
                name = 'Random_' + Math.floor(Math.random() * 100 + 1);
            }

            H.loadDecks();

            if (H.activeDeck) {
                send('join', {
                    name: name,
                    deck: H.activeDeck
                });
            } else {
                window.alert('Deck is not selected');
            }

        };

        H.socket.onclose = event => {
            if (!event.wasClean) {
                console.log('Обрыв соединения');
                console.warn('Code:', event.code);

                if (H.checkParam('autoreload')) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }

                H.activateScreen('connection-lost');
            }
        };

        H.socket.onerror = error => {
            console.warn('Socket Error', error.message);
        };

        H.socket.onmessage = event => {

            const message = JSON.parse(event.data);

            const msg = message.msg;
            const data = message.data;

            console.log('Server Message:', message);

            switch (msg) {
                case 'battle-started':
                    H.activateScreen('battle');

                    if (H.checkParam('endturn')) {
                        setInterval(() => {
                            if (H.battleData && H.battleData.my.active) {
                                send('end-turn');
                            }
                        }, 500);
                    }

                    H.drawWelcome(data);

                    break;

                case 'cards-for-repick':
                    H.drawCardsForPick(data);

                    if (H.checkParam('endturn')) {
                        $('.repick-layer .confirm').click();
                    }
                    break;

                case 'game-data':
                    H.battleData = data;
                    H.updateInGameData();
                    break;
                case 'targets':
                    H.updateInGameTargets(data);
                    break;
                default:
                    console.warn('Unhandled Message:', msg);
            }
        };

        $app.on('click', '.cancel', () => {
            H.socket.close();
            H.activateScreen('main-menu');
        });
    },

    destroy: function() {
        clearInterval(this.intervalId);
    }
});
