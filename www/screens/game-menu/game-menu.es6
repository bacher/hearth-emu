
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
                H.app.getActiveScreen().concede();
            })
            .on('click', '.options', () => {
                console.log('O');
            })
            .on('click', '.quit', () => {
                window.location = '/';
            });
    }

    close() {
        this.closed = true;
        this.hideThenDestroy();
    }
};
