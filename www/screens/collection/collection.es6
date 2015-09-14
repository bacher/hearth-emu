
H.Screens['collection'] = class CollectionScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'c',
            name: 'collection',
            hash: 'collection'
        });

        this._cards = null;
        this._currentCards = null;

        this._costFilter = null;

        this._decksScreen = null;
        this._deckScreen = null;

        this.page = 0;
    }

    _render() {
        render(this.$node, 'collection');

        this._$cards = this.$node.find('.cards');

        this._checkCardsCache();

        setTimeout(() => {
            this._decksScreen = H.app.activateOverlay('collection-decks');
        }, 0);
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.tab', e => {
                const $tab = $(e.currentTarget);

                this._selectTab($tab);

                this.drawCards();
            })
            .on('click', '.card:not(.lock)', e => {
                if (!this._deckScreen || !this._deckScreen.canAddCard()) {
                    return;
                }

                this._deckScreen.addCard($(e.currentTarget).data('id'));
            })
            .on('click', '.btn-back', () => {
                if (this._deckScreen) {
                    this._deckScreen.hideThenDestroy();
                }

                if (this._decksScreen) {
                    this._decksScreen.hideThenDestroy();
                }

                H.app.activateScreen('main-menu');
            })
            .on('click', '.scroll-zone.left', () => {
                this.page--;

                this.drawCards();
            })
            .on('click', '.scroll-zone.right', () => {
                this.page++;

                this.drawCards();
            })
            .on('focusout', '.search', () => {
                this._filterCards();

                this.drawCards();
            })
            .on('keydown', '.search', e => {
                if (e.which === 13) {
                    $(e.currentTarget).blur();
                }
            })
            .on('click', '.mana', e => {
                const $mana = $(e.currentTarget);

                if ($mana.hasClass('selected')) {
                    $mana.removeClass('selected');

                    this._costFilter = null;

                } else {
                    this.$node.find('.mana.selected').removeClass('selected');
                    $mana.addClass('selected');

                    this._costFilter = $mana.data('cost');
                }

                this._filterCards();
                this.drawCards();
            });
    }

    _show() {
        setTimeout(() => {
            this.$node.show();

            setTimeout(() => {
                this.$node.find('.collection').removeClass('initial');
            }, 50);
        }, 1050);
    }

    _checkCardsCache() {
        if (H.cards) {
            this._cardsLoaded();
        } else {
            $.ajax({
                url: '/cards.json'
            }).then(data => {
                H.cards = {
                    all: data.cards,
                    [H.CLASSES.neutral]: [],
                    [H.CLASSES.warrior]: [],
                    [H.CLASSES.shaman]: [],
                    [H.CLASSES.rogue]: [],
                    [H.CLASSES.paladin]: [],
                    [H.CLASSES.hunter]: [],
                    [H.CLASSES.druid]: [],
                    [H.CLASSES.warlock]: [],
                    [H.CLASSES.mage]: [],
                    [H.CLASSES.priest]: []
                };

                H.cardsHash = {};

                data.cards.forEach(card => {
                    H.cards[card.clas].push(card);
                    H.cardsHash[card.id] = card;
                });

                this._cardsLoaded();
            });
        }
    }

    _cardsLoaded() {
        this._getCards();

        this._selectTab(this.$node.find('.tab.druid'));

        this._filterCards();

        this._updateTabs();

        this.drawCards();
    }

    _getCards() {
        this._cards = [];

        for (var i = 0; i < 10; ++i) {
            this._cards[i] = H.cards[i].filter(card => !card.flags['uncollectable']);
        }
    }

    _filterCards() {
        const searchQuery = this.$node.find('.search').val().toLowerCase();

        this._currentCards = this._cards.map((cardPack, i) => {
            if (this._deckScreen) {
                if (i !== 0 && i !== this._deckScreen.getDeckInfo().clas) {
                    return [];
                }
            }

            var filteredPack = cardPack;

            if (searchQuery) {
                filteredPack = filteredPack.filter(card => _.contains(card.name.toLowerCase(), searchQuery));
            }

            if (this._costFilter !== null) {
                if (this._costFilter < 7) {
                    filteredPack = filteredPack.filter(card => card.cost === this._costFilter);
                } else {
                    filteredPack = filteredPack.filter(card => card.cost >= 7);
                }
            }

            return filteredPack;
        });
    }

    _getSelectedClass() {
        const $tab = this.$node.find('.tab.selected');

        if ($tab.length) {
            return H.CLASSES[$tab.data('clas')];
        }
    }

    drawCards() {
        this._$cards.empty();

        const clas = this._getSelectedClass();

        if (clas != null) {
            const cardsPool = this._currentCards[clas];

            const cards = cardsPool.slice(this.page * 8, this.page * 8 + 8);

            this.$node.find('.scroll-zone.left').toggle(this.page !== 0);
            this.$node.find('.scroll-zone.right').toggle(this.page * 8 + 8 < cardsPool.length);

            this.$node.find('.cards-empty').toggle(cards.length === 0);

            render(this._$cards, 'collection-cards', {
                cards: cards
            });

            this._initCardsLoadAnimation(cards);

            this.checkCardLimits();
        }
    }

    _initCardsLoadAnimation(cards) {
        const loadCards = [];

        cards.forEach((card, i) => {
            if (!card.loaded) {
                const img = new Image();

                const picUrl = H.makeCardUrl(card.pic);
                const $card = this._$cards.find('.card').eq(i);
                const $img = $(img).addClass('img front').hide();
                $card.append($img);
                loadCards.push($card);

                img.onload = () => {
                    $card.addClass('animate');
                    $card.removeClass('loading');
                    $img.data('loaded', true).show();

                    card.loaded = true;
                };

                img.src = picUrl;
            }
        });

        setTimeout(() => {
            loadCards.forEach($card => {
                const $cardFront = $card.find('.front');

                if (!$cardFront.data('loaded')) {
                    $card.append($('<IMG>').addClass('img back').attr('src', '../cards/card_back.png'));
                    $card.addClass('loading');
                }
            });
        }, 0);
    }

    _updateTabs() {
        for (var i = 0; i < 10; ++i) {
            this.$node.find('.tab.' + H.CLASSES_L[i]).toggleClass('hide', this._currentCards[i].length === 0);
        }

        if (this.$node.find('.tab.selected:not(.hide)').length === 0) {
            const $tab = this.$node.find('.tab:not(.hide)').eq(0);

            if ($tab.length) {
                this._selectTab($tab);
            } else {
                this._selectTab(null);
            }
        }
    }

    checkCardLimits() {
        if (this._deckScreen) {
            this.$node.find('.card').each((i, cardNode) => {
                const $card = $(cardNode);
                const id = $card.data('id');

                const cardIds = this._deckScreen.getCardIds();

                const alreadyInDeck = cardIds.filter(cardId => cardId === id).length;

                $card.removeClass('lock one');

                if (alreadyInDeck >= 1 && $card.hasClass('unique')) {
                    $card.addClass('lock');
                } else if (alreadyInDeck >= 2) {
                    $card.addClass('lock');
                } else if (alreadyInDeck === 1) {
                    $card.addClass('one');
                }
            });
        } else {
            this.$node.find('.card').removeClass('lock one');
        }
    }

    deckCreated(deckId) {
        this._decksScreen.hideThenDestroy();
        this._decksScreen = null;

        this._deckScreen = H.app.activateOverlay('collection-deck', {
            deckId: deckId
        });

        this._afterChange();
    }

    switchMode(mode, deckId) {
        if (mode === 'deck') {
            this._decksScreen.hideThenDestroy();
            this._decksScreen = null;

            this._deckScreen = H.app.activateOverlay('collection-deck', {
                deckId: deckId
            });
        } else {
            this._deckScreen.hideThenDestroy();
            this._deckScreen = null;

            this._decksScreen = H.app.activateOverlay('collection-decks');
        }

        this._afterChange();
    }

    _afterChange() {
        this._filterCards();
        this._updateTabs();
        this.drawCards();
        this.checkCardLimits();
    }

    _selectTab($tab) {
        this.page = 0;

        this.$node.find('.tab.selected').removeClass('selected');

        this.$node.find('.class-bg')
            .removeClass('warrior warlock paladin mage priest rogue shaman hunter druid neutral');

        if ($tab) {
            $tab.addClass('selected');

            this.$node.find('.class-bg').addClass($tab.data('clas'));
        }
    }

};
