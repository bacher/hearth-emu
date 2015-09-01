
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

            var name;
            const nameMatch = window.location.search.match(/[?&]name=([^&]*)/);

            if (nameMatch) {
                name = nameMatch[1];
            } else {
                name = 'Random_' + Math.floor(Math.random() * 100 + 1);
            }

            const deck = JSON.parse(window.localStorage.getItem('decks'))[0];
            send('join', {
                name: name,
                deck: {
                    clas: hbe.CLASSES[deck.clas],
                    cards: deck.cards
                }
            });
        };

        socket.onclose = event => {
            if (!event.wasClean) {
                console.log('Обрыв соединения');
                console.warn('Code:', event.code);

                if (checkParam('autoreload')) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            }
        };

        socket.onerror = error => {
            console.warn('Socket Error', error.message);
        };

        socket.onmessage = event => {

            const message = JSON.parse(event.data);

            const msg = message.msg;
            const data = message.data;

            console.log('Server Message:', message);

            switch (msg) {
                case 'battle-started':
                    hbe.activateScreen('battle');

                    if (checkParam('endturn')) {
                        setInterval(() => {
                            if (hbe.battleData && hbe.battleData.my.active) {
                                send('end-turn');
                            }
                        }, 500);
                    }

                    drawWelcome(data);

                    break;

                case 'cards-for-repick':
                    drawCardsForPick(data);

                    if (checkParam('endturn')) {
                        $('.repick-layer .confirm').click();
                    }
                    break;

                case 'game-data':
                    hbe.battleData = data;
                    updateInGameData();
                    break;
                case 'targets':
                    updateInGameTargets(data);
                    break;
                default:
                    console.warn('Unhandled Message:', msg);
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
