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
                const chooseHero = H.app.activateOverlay('choose-hero-deck', {
                    onlyBasic: true,
                    onChoose: selectInfo => {
                        const clas = selectInfo.heroClass;
                        const className = H.CLASSES_L[clas];

                        const deckInfo = {
                            label: 'Custom ' + _.capitalize(className),
                            clas: clas,
                            cardIds: [],
                            id: _.random(10000)
                        };

                        H.decks.push(deckInfo);

                        H.saveDecks();

                        H.app.getActiveScreen().deckCreated(deckInfo.id);

                        chooseHero.close();
                    },
                    onBack: () => {
                        chooseHero.close();
                    }
                });
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
    }

    _removeDeck(removeId) {
        H.decks = H.decks.filter(deck => deck.id !== removeId);
        H.saveDecks();

        this.drawDecks();
    }

    drawDecks() {
        render(this.$node.find('.decks-wrapper'), 'decks', { decks: H.decks });
    }
};
