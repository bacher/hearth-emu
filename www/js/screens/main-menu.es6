
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
                H.activateScreen('start-game-menu');
            })
            .on('click', '.my-collection', () => {
                H.activateScreen('collection');
            });
    }
};
