
H.Screens['main-menu'] = class MainMenuScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'm',
            name: 'main-menu'
        });
    }

    _render() {
        render(this.$node, 'main-menu');

        setTimeout(() => {
            this.$node.find('.disk').addClass('ready');
            this.$node.find('.footer').addClass('ready');
        }, 1500);
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.play', () => {
                H.app.activateScreen('start-game-menu');
            })
            .on('click', '.my-collection', () => {
                H.app.activateScreen('collection');
            });
    }

    _hide() {
        return new Promise((resolve, reject) => {

            this.$node.find('.disk').removeClass('ready');

            setTimeout(() => {
                const $layer = this.$node.find('.layer');
                $layer.appendTo($('#app'));
                $layer.show();

                setTimeout(() => {
                    this.$node.find('.main-menu').addClass('opening');
                    $layer.find('.overlay').addClass('opening');

                    setTimeout(() => {
                        $layer.remove();
                        resolve();
                    }, 1200);
                }, 100);
            }, 1000);
        });
    }
};
