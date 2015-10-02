
H.Screens['game-menu'] = class GameMenuScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'gm',
            name: 'game-menu',
            hash: false
        });
    }

    _render() {
        render(this.$node, 'game-menu', {
            inBattle: H.app.getActiveScreen().name === 'battle'
        });
    }

    _show() {
        this.$node.show();

        $('.settings-btn').addClass('active');
    }

    _bindEventListeners() {
        this.$node
            .on('click', e => {
                if (!e.isDefaultPrevented()) {
                    this.close();
                }
            })
            .on('click', '.game-menu', e => {
                e.preventDefault();
            })
            .on('click', '.concede', () => {
                this.close();
                H.app.getActiveScreen().concede();
            })
            .on('click', '.options', () => {
                this.close();
                H.app.activateOverlay('options');
            })
            .on('click', '.quit', () => {
                window.location = '/';
            })
            .on('click', '.resume', () => {
                this.close();
            });
    }

    close() {
        this.closed = true;

        $('.settings-btn').removeClass('active');

        this.hideThenDestroy();
    }
};
