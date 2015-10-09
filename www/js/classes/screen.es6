
H.Screen = class Screen {
    constructor(info) {
        this.gClass = info.gClass || null;
        this.name = info.name;

        if (info.hash !== false) {
            this.hashLocation = '#' + (info.hash || '');
        }
    }

    make() {
        this.setLocationHash();

        this.$node = $('<DIV>')
            .css('display', 'none')
            .addClass('screen');

        if (this.gClass) {
            this.$node.addClass(this.gClass);
        }

        this._render();

        this._bindEventListeners();
    }

    _render() {}

    _bindEventListeners() {}
    _unbindEventListeners() {}

    getNode() {
        return this.$node;
    }

    show() {
        this._show();

        this._onShow();
    }

    _show() {
        this.$node.show();
    }

    _onShow() {}

    _onHide() {}

    hide() {
        this._onHide();

        const promise = this._hide();

        setTimeout(() => {
            this.enableMenu();
        }, 10);

        return promise || Promise.resolve();
    }

    hideThenDestroy() {
        this.hide().then(() => {
            this.destroy();
        });
    }

    _hide() {
        this.$node.hide();
    }

    destroy() {
        this._unbindEventListeners();

        if (this._destroy) {
            this._destroy();
        }

        if (this._globalBound) {
            this._globalBound.forEach(listenerInfo => {
                H.off(listenerInfo.eventName, listenerInfo.callback);
            });
        }

        this.$node.off();
        this.$node.remove();
    }

    setLocationHash() {
        if (this.hashLocation) {
            window.location.hash = this.hashLocation;
        }
    }

    disableMenu() {
        this._disableMenu = true;
    }

    enableMenu() {
        this._disableMenu = false;
    }

    onGlobal(eventName, callback) {
        this._globalBound = this._globalBound || [];
        this._globalBound.push({ eventName, callback });

        H.on(eventName, callback);
    }
};
