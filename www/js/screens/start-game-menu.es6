
H.Screens['start-game-menu'] = class StartGameMenuScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'sg',
            name: 'start-game-menu',
            hash: 'start-game'
        });
    }

    _render() {
        render(this.$node, 'start-game-menu', {
            decks: H.decks
        });

        H.loadDecks();

        if (H.activeDeck) {
            setTimeout(() => {
                $('.deck[data-id="' + H.activeDeck.id + '"]').click();
            }, 4);
        }
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.deck:not(.selected)', e => {
                const $deck = $(e.currentTarget);

                $('.deck.selected').removeClass('selected');
                $deck.addClass('selected');

                const deckId = $deck.data('id');

                H.activeDeck = H.getDeckById(deckId);

                $('.hero .avatar')
                    .removeClass()
                    .addClass('avatar')
                    .addClass(H.CLASSES_L[H.activeDeck.clas]);
                $('.hero .label').text(H.activeDeck.label);

                $('.play-btn').show();

                H.saveDecks();
            })
            .on('click', '.play-btn', () => {
                H.activateScreen('waiting-opponent');
            })
            .on('click', '.back', () => {
                H.activateScreen('main-menu');
            });
    }
};
