
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

            prevScreen.hide().then(() => {
                prevScreen.destroy();
            });
        }

        this.activeScreen = newActiveScreen;

        this.activeScreen.show();
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
