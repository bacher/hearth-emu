H.Screens['collection-deck'] = class CollectionDeckScreen extends H.Screen {
    constructor(params) {
        super({
            gClass: 'cde',
            name: 'collection-deck',
            hash: false
        });

        this._deck = _.find(H.decks, deck => deck.id === params.deckId);

        this._$previewImage = null;
    }

    _render() {
        render(this.$node, 'collection-deck', { deck: this._deck });

        this._updateDeckCards();
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.card-line', e => {
                const $cardLine = $(e.currentTarget);

                const id = $cardLine.data('id');

                const index = this._deck.cardIds.indexOf(id);
                this._deck.cardIds.splice(index, 1);

                H.saveDecks();

                H.app.getActiveScreen().checkCardLimits();

                this._updateDeckCards();
            })
            .on('mouseenter', '.card-line', e => {
                const $cardLine = $(e.currentTarget);
                const cardPosition = $cardLine.position();

                this._removeCardPreview();

                this._$previewImage = render(null, 'deck-card-preview', H.cardsHash[$cardLine.data('id')]);

                this._$previewImage.css({
                    top: Math.min(268, Math.max(20, cardPosition.top - 123))
                });

                this.$node.append(this._$previewImage);
            })
            .on('mouseleave', '.card-line', () => {
                this._removeCardPreview();
            })
            .on('click', '.btn-done', () => {
                this._deck.label = this.$node.find('.label-edit').val();

                H.saveDecks();

                H.app.getActiveScreen().switchMode('decks');
            });
    }

    getDeckInfo() {
        return this._deck;
    }

    getCardIds() {
        return this._deck.cardIds;
    }

    canAddCard() {
        return this._deck.cardIds.length !== 30;
    }

    _updateDeckCards() {
        const $cards = this.$node.find('.deck-cards');

        const cards = [];

        const ids = this._deck.cardIds;

        var hasUnimplementedCard = false;

        for (var i = 0; i < ids.length; ++i) {
            const id = ids[i];

            const card = H.cardsHash[id];
            var multiplyer = 1;

            if (id === ids[i + 1]) {
                multiplyer = 2;
                i++;
            }

            cards.push({
                card,
                x2: multiplyer === 2
            });

            if (card.flags['unimplemented']) {
                hasUnimplementedCard = true;
            }
        }

        cards.forEach(card => {
            new Image().src = H.makeCardUrl(card.card.pic);
        });

        this._removeCardPreview();

        render($cards, 'card-lines', { cards: cards });

        this.$node.find('.card-count .number').text(ids.length + '/30');

        this.$node.find('.hero-right-panel')
            .toggleClass('full', ids.length === 30)
            .toggleClass('unavailable', hasUnimplementedCard);
    }

    _removeCardPreview() {
        if (this._$previewImage) {
            this._$previewImage.remove();
            this._$previewImage = null;
        }
    }

    addCard(cardId) {
        this._deck.cardIds.push(cardId);

        this._sortDeckCards();

        H.saveDecks();

        H.app.getActiveScreen().checkCardLimits(this._deck.cardIds);

        this._updateDeckCards();
    }

    _sortDeckCards() {
        this._deck.cardIds = this._deck.cardIds.sort((cardId1, cardId2) => {
            if (cardId1 === cardId2) {
                return 0;
            }

            const card1 = H.cardsHash[cardId1];
            const card2 = H.cardsHash[cardId2];

            if (card1.cost !== card2.cost) {
                return card1.cost - card2.cost;
            } else {
                return card1.name.localeCompare(card2.name);
            }
        });
    }
};
