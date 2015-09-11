
H.Application = class Application {
    constructor() {
        this.$node = $('#app');
        this.activeScreen = null;
    }

    activateScreen(name) {
        const newActiveScreen = new H.Screens[name]();

        newActiveScreen.make();

        this.$node.append(newActiveScreen.getNode());

        if (this.activeScreen) {
            const prevScreen = this.activeScreen;

            prevScreen.hideThenDestroy();
        }

        this.activeScreen = newActiveScreen;

        this.activeScreen.show();
    }

    activateOverlay(name) {
        const overlayScreen = new H.Screens[name]();

        overlayScreen.make();

        this.$node.append(overlayScreen.getNode());

        overlayScreen.show();
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
};
