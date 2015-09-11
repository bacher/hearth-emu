
H.Screens['loading'] = class LoadingScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'l',
            name: 'loading',
            hash: false
        });

        this._onSuccessLoad = this._onSuccessLoad.bind(this);
        this._onBadLoad = this._onBadLoad.bind(this);
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

            img.onload = this._onSuccessLoad;
            img.onerror = this._onBadLoad;

            img.src = 'textures/' + imageName;
        });

        setTimeout(() => {
            this._onLoad();
        }, 2000);
    }

    _onSuccessLoad() {
        this.loaded++;
        this._check();
    }

    _onBadLoad() {
        this.bad++;
        this._check();
    }

    _check() {
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
