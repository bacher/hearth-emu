H.Screens['collection-decks'] = class CollectionDecksScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'cds',
            name: 'collection-decks',
            hash: false
        });
    }

    _render() {
        render(this.$node, 'collection-decks');

        this.drawDecks();
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.new-deck', () => {
                H.app.activateOverlay('new-deck-menu');
            })
            .on('click', '.deck', e => {
                const $deck = $(e.currentTarget);
                const id = $deck.data('id');

                H.app.getActiveScreen().switchMode('deck', id);
            })
            .on('click', '.deck .remove', e => {
                this._removeDeckId = $(e.currentTarget).closest('.deck').data('id');

                this.$node.find('.confirm').show();

                e.stopPropagation();
            })
            .on('click', '.confirm .ok', () => {
                this._removeDeck(this._removeDeckId);

                this.$node.find('.confirm').hide();
            })
            .on('click', '.confirm .cancel', () => {
                this.$node.find('.confirm').hide();
            });

        this.onGlobal('decks-updated', () => {
            this.drawDecks();
        });
    }

    _removeDeck(removeId) {
        H.decks = H.decks.filter(deck => deck.id !== removeId);
        H.saveDecks();

        this.drawDecks();
    }

    drawDecks() {
        render(this.$node.find('.decks-wrapper'), 'decks', { decks: H.decks });

        this.$node.find('.new-deck').toggle(H.decks.length < 9);
    }
};
