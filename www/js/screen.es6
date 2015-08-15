
class Screen {
    constructor(info) {
        this.gClass = info.gClass;
        this.name = info.name;
        this._draw = info.draw;
        this._destroy = info.destroy;
        this.hashLocation = info.hash || '';

        hbe.screens.push(this);
    }

    draw() {
        this.setLocationHash();

        $app.addClass(this.gClass);

        this._draw();

        $(window).scrollTop(0);
    }

    destroy() {
        $app.off();
        $app.removeClass(this.gClass);

        if (this._destroy) {
            this._destroy();
        }
    }

    setLocationHash() {
        window.location.hash = '#' + this.hashLocation;
    }
}
