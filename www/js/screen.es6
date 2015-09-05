
H.Screen = class Screen {
    constructor(info) {
        this.gClass = info.gClass;
        this.name = info.name;
        this._draw = info.draw;
        this._destroy = info.destroy;

        if (info.hash !== false) {
            this.hashLocation = '#' + (info.hash || '');
        }

        H.screens.push(this);
    }

    draw() {
        this.setLocationHash();

        $app.addClass(this.gClass);

        this._draw();

        $(window).scrollTop(0);
    }

    destroy() {
        $app.off();
        $app.removeClass();

        if (this._destroy) {
            this._destroy();
        }
    }

    setLocationHash() {
        if (this.hashLocation) {
            window.location.hash = this.hashLocation;
        }
    }
};
