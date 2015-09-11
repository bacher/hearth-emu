
H.Screen = class Screen {
    constructor(info) {
        this.gClass = info.gClass;
        this.name = info.name;

        if (info.hash !== false) {
            this.hashLocation = '#' + (info.hash || '');
        }
    }

    make() {
        this.setLocationHash();

        this.$node = $('<DIV>')
            .css('display', 'none')
            .addClass('screen')
            .addClass(this.gClass);

        this._render();

        this._bindEventListeners();

        $(window).scrollTop(0);
    }

    _bindEventListeners() {}

    getNode() {
        return this.$node;
    }

    show() {
        this._show();
    }

    _show() {
        this.$node.show();
    }

    hide() {
        const promise = this._hide();

        return promise || Promise.resolve();
    }

    _hide() {
        this.$node.hide();
    }

    destroy() {
        if (this._destroy) {
            this._destroy();
        }

        this.$node.off();
        this.$node.remove();
    }

    setLocationHash() {
        if (this.hashLocation) {
            window.location.hash = this.hashLocation;
        }
    }
};
