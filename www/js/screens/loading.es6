
H.Screens['loading'] = class LoadingScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'l',
            name: 'loading',
            hash: false
        });
    }

    _render() {
        render(this.$node, 'loading');

        H.loadDecks();

        $.ajax({
            url: 'textures.json'
        }).then(this._onTexturesLoad.bind(this));
    }

    _show() {
        this.$node.show();

        this._glowTimeout = setTimeout(() => {
            this.$node.find('.stone').addClass('glow-1');
            this.$node.find('.label').addClass('loaded');
        }, 500);
    }

    _destroy() {
        clearTimeout(this._glowTimeout);
    }

    _onTexturesLoad(data) {
        this.loaded = 0;
        this.bad = 0;
        this.all = data.length - 1;

        data.forEach(imageName => {
            const img = new Image();

            img.onload = () => {
                this.loaded++;
                this.check();
            };

            img.onerror = () => {
                this.bad++;
                this.check();
            };

            img.src = 'textures/' + imageName;
        });

        setTimeout(() => {
            this._onLoad();
        }, 2000);
    }

    check() {
        if (this.all === this.loaded + this.bad) {
            this._onLoad();
        }
    }

    _onLoad() {
        this._onLoad = $.noop;

        const hash = window.location.hash;

        if (H.checkParam('gobattle')) {
            H.app.activateScreen('waiting-opponent');
        } else if (hash === '#collection') {
            H.app.activateScreen('collection');
        } else if (hash === '#start-game' || hash === '#battle') {
            H.app.activateScreen('start-game-menu');
        } else {
            H.app.activateScreen('main-menu');
        }
    }
};
