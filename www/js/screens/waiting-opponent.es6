
H.Screens['waiting-opponent'] = class WaitingOpponentScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'w',
            name: 'waiting-opponent',
            hash: ''
        });

        H.socket = new H.Socket(new WebSocket('ws://localhost:8081/'));
    }

    _render() {
        render(this.$node, 'waiting-opponent');

        const $anim = this.$node.find('.animation');
        var step = 1;

        this.intervalId = setInterval(function() {
            $anim.removeClass('s' + step);
            step++;

            if (step > 5) {
                step = 0;
            }

            $anim.addClass('s' + step);
        }, 100);
    }

    _bindEventListeners() {
        H.socket.on('battle-started', this._onBattleStarted.bind(this));

        this.$node.on('click', '.cancel', () => {
            H.socket.close();
            H.app.activateScreen('main-menu');
        });
    }

    _onBattleStarted(data) {
        H.app.activateScreen('battle').setBattleData(data);
    }

    _destroy() {
        clearInterval(this.intervalId);
    }
};
