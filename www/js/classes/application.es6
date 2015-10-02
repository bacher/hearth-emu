
H.Application = class Application {
    constructor() {
        this.$node = $('#app');
        this.activeScreen = null;

        this._sceens = [];
    }

    activateScreen(name, params) {
        const newActiveScreen = new H.Screens[name](params);

        this._sceens.push(newActiveScreen);

        newActiveScreen.make();

        this.$node.append(newActiveScreen.getNode());

        if (this.activeScreen) {
            const prevScreen = this.activeScreen;

            prevScreen.hideThenDestroy();
        }

        this.activeScreen = newActiveScreen;

        this.activeScreen.show();

        return this.activeScreen;
    }

    activateOverlay(name, params) {
        const overlayScreen = new H.Screens[name](params);

        this._sceens.push(overlayScreen);

        overlayScreen.make();

        this.$node.append(overlayScreen.getNode());

        overlayScreen.show();

        return overlayScreen;
    }

    getActiveScreen() {
        return this.activeScreen;
    }

    fitScreen() {
        const windowWidth = $(window).width();

        if (windowWidth !== 1280) {
            $('BODY').css({
                'transform': 'scale(' + (windowWidth / 1280) + ')',
                'transform-origin': '0 0'
            });
        } else {
            $('BODY').css({
                'transform': '',
                'transform-origin': ''
            });
        }
    }

    checkAllowMenu() {
        return !this._sceens.some(screen => screen._disableMenu);
    }
};
