
new H.Screen({
    gClass: 'sg',
    name: 'start-game-menu',
    hash: 'start-game',
    draw: function() {
        render($app, 'start-game-menu', {
            decks: H.decks
        });

        if (H.activeDeckId !== null) {
            $('.deck[data-id="' + H.activeDeckId + '"]').click();
        }

        $app
            .on('click', '.deck', e => {
                const $deck = $(e.currentTarget);

                $deck.addClass('selected');

                const deckId = $deck.data('id');

                const deck = _.find(H.decks, deck => deck.id === deckId);

                $('.hero .avatar').addClass(H.CLASSES_L[deck.clas]);
                $('.hero .label').text(deck.label);

                H.saveDecks();
            });
    }
});
