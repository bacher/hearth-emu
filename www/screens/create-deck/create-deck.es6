
H.Screens['create-deck'] = class CreateDeckScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'cd',
            name: 'create-deck',
            hash: false
        });
    }

    _render() {
        render(this.$node, 'create-deck');
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.hero', e => {
                const $hero = $(e.currentTarget);

                $hero.siblings().removeClass('selected');
                $hero.addClass('selected');

                const clas = $hero.data('clas');

                this.$node.find('.avatar')
                    .removeClass()
                    .addClass('avatar')
                    .addClass(H.CLASSES_L[clas]);

                this.$node.find('.hero-details .label').text(H.HERO_NAMES[clas]);

                this.$node.find('.choose').show();
            })
            .on('click', '.choose', () => {
                const clas = this.$node.find('.hero.selected').data('clas');
                const className = H.CLASSES_L[clas];

                H.decks.push({
                    label: 'Custom ' + className[0].toUpperCase() + className.substr(1),
                    clas: clas,
                    cardIds: [],
                    id: Math.floor(Math.random() * 10000)
                });

                H.saveDecks();

                const collectionScreen = H.app.getActiveScreen();

                collectionScreen.drawDecks();

                collectionScreen.switchMode(H.decks[H.decks.length - 1]);

                this.hideThenDestroy();
            })
            .on('click', '.back', () => {
                this.hideThenDestroy();
            });
    }
};
