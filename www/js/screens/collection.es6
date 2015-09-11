
H.Screens['collection'] = class CollectionScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'c',
            name: 'collection',
            hash: 'collection'
        });

        this.page = 0;
        this.heroMode = false;
        this.activeDeck = null;
        this.$cardToRemove = null;
        this.$previewImage = null;

        this.showCardsBase = null;
        this.showCards = null;

        this.costFilter = null;
    }

    _render() {
        render(this.$node, 'collection');

        this.selectTab(this.$node.find('.tab.druid'));

        this.drawDecks();

        if (H.cards) {
            this.afterLoad();
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

                this.afterLoad();
            });
        }

    }

    _bindEventListeners() {
        this.$node
            .on('click', '.new-deck', () => {
                H.app.activateOverlay('create-deck');
            })
            .on('click', '.tab', e => {
                const $tab = $(e.currentTarget);

                this.selectTab($tab);
            })
            .on('click', '.my-decks .deck', e => {
                const $deck = $(e.currentTarget);
                const id = $deck.data('id');

                const deck = _.find(H.decks, deck => deck.id === id);

                this.switchMode(deck);
            })
            .on('click', '.card:not(.lock)', e => {
                if (this.activeDeck && this.activeDeck.cardIds.length < 30) {
                    this.activeDeck.cardIds.push($(e.currentTarget).data('id'));

                    this.sortCards(this.activeDeck);

                    H.saveDecks();

                    this.checkLimits();

                    this.updateDeckCards();
                }
            })
            .on('click', '.btn-back', () => {
                if (this.heroMode) {
                    this.activeDeck.label = $('.label-edit').val();
                    H.saveDecks();

                    this.switchMode(null);
                } else {
                    H.app.activateScreen('main-menu');
                }
            })
            .on('click', '.scroll-zone.left', () => {
                this.page--;

                this.drawCards();
            })
            .on('click', '.scroll-zone.right', () => {
                this.page++;

                this.drawCards();
            })
            .on('click', '.card-line', e => {
                const $cardLine = $(e.currentTarget);

                const id = $cardLine.data('id');

                const index = this.activeDeck.cardIds.indexOf(id);
                this.activeDeck.cardIds.splice(index, 1);

                H.saveDecks();

                this.checkLimits();
                this.updateDeckCards();
            })
            .on('click', '.deck .remove', e => {
                this.$cardToRemove = $(e.currentTarget).parent();
                $('.confirm').show();

                e.stopPropagation();
            })
            .on('click', '.confirm .ok', () => {
                this.removeDeck(this.$cardToRemove.data('id'));
                $('.confirm').hide();
            })
            .on('click', '.confirm .cancel', () => {
                $('.confirm').hide();
            })
            .on('focusout', '.search', () => {
                this.filterCards();

                this.drawCards();
            })
            .on('keydown', '.search', e => {
                if (e.which === 13) {
                    $(e.currentTarget).blur();
                }
            })
            .on('mouseenter', '.card-line', e => {
                const $cardLine = $(e.currentTarget);
                const cardPosition = $cardLine.position();

                if (this.$previewImage) {
                    this.$previewImage.remove();
                    this.$previewImage = null;
                }

                this.$previewImage = $('<img>')
                    .addClass('card-preview')
                    .attr('src', $cardLine.data('pic'))
                    .css({
                        top: Math.min(268, Math.max(20, cardPosition.top + - 123))
                    })
                    .appendTo(this.$node);
            })
            .on('mouseleave', '.card-line', () => {
                this.removeCardPreview();
            })
            .on('click', '.mana', e => {
                const $mana = $(e.currentTarget);

                if ($mana.hasClass('selected')) {
                    $mana.removeClass('selected');

                    this.costFilter = null;

                } else {
                    $('.mana.selected').removeClass('selected');
                    $mana.addClass('selected');

                    this.costFilter = $mana.data('cost');
                }

                this.filterCards();
                this.drawCards();
            });
    }

    afterLoad() {
        this.makeBaseFiltering();

        this.filterCards();

        this.drawCards();
    }

    removeCardPreview() {
        if (this.$previewImage) {
            this.$previewImage.remove();
            this.$previewImage = null;
        }
    }

    makeBaseFiltering() {
        this.showCardsBase = [];

        for (var i = 0; i < 10; ++i) {
            this.showCardsBase[i] = H.cards[i].filter(card => !card.flags['uncollectable']);
        }
    }

    filterCards() {
        const searchQuery = $('.search').val().toLowerCase();

        this.showCards = this.showCardsBase.map((cardPack, i) => {
            var filteredPack = cardPack;

            if (i === 0 || !this.heroMode || i === this.activeDeck.clas) {
                if (searchQuery) {
                    filteredPack = filteredPack.filter(card => _.contains(card.name.toLowerCase(), searchQuery));
                }

                if (this.costFilter !== null) {
                    if (this.costFilter < 7) {
                        filteredPack = filteredPack.filter(card => card.cost === this.costFilter);
                    } else {
                        filteredPack = filteredPack.filter(card => card.cost >= 7);
                    }
                }
            } else {
                filteredPack = [];
            }

            return filteredPack;
        });

        this.toggleTabs();
    }

    drawCards() {
        if (!this.showCardsBase) { return; }

        const selectedClas = H.CLASSES[$('.tab.selected').data('clas')];

        const cardsPool = (this.showCards || this.showCardsBase)[selectedClas];

        const $cards = $('.cards');
        const cards = cardsPool.slice(this.page * 8, this.page * 8 + 8);

        $('.scroll-zone.left').toggle(this.page !== 0);
        $('.scroll-zone.right').toggle(this.page * 8 + 8 < cardsPool.length);

        $('.cards-empty').toggle(cards.length === 0);

        if (cards.length === 0) {
            $cards.empty();

        } else {
            render($cards, 'collection-cards', {
                cards: cards
            });

            const loadCards = [];

            cards.forEach((card, i) => {
                if (!card.loaded) {
                    const img = new Image();

                    const picUrl = H.makeCardUrl(card.pic);
                    const $card = $cards.find('.card').eq(i);
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

            this.checkLimits();
        }
    }

    toggleTabs() {
        for (var i = 0; i < 10; ++i) {
            $('.tab.' + H.CLASSES_L[i]).toggle(this.showCards[i].length > 0);
        }

        if ($('.tab.selected:visible').length === 0) {
            this.selectTab($('.tab:visible:eq(0)'));
        } else {
            $('.tab.selected').removeClass('.selected');
        }
    }

    drawDecks() {
        render(this.$node.find('.decks-wrapper'), 'decks', { decks: H.decks });
    }

    checkLimits() {
        if (this.heroMode && this.activeDeck) {
            this.$node.find('.card').each((i, cardNode) => {
                const $card = $(cardNode);
                const id = $card.data('id');

                const alreadyInDeck = this.activeDeck.cardIds.filter(cardId => cardId === id).length;

                $card.removeClass('lock one');

                if (alreadyInDeck >= 1 && $card.hasClass('unique')) {
                    $card.addClass('lock');
                } else if (alreadyInDeck >= 2) {
                    $card.addClass('lock');
                } else if (alreadyInDeck === 1) {
                    $card.addClass('one');
                }
            });
        }
    }

    switchMode(deck) {
        this.heroMode = !!deck;
        $('.collection').toggleClass('hero-mode', !!deck);

        this.activeDeck = deck || null;

        if (deck) {
            this.filterCards();

            const $deck = $('.deck[data-id="' + deck.id + '"]');
            const $deckInfo = $deck.clone();
            $deckInfo.append($('<INPUT>').addClass('label-edit').val($deck.find('.label').text()));

            $('.hero-right-panel .deck-info').html($deckInfo);

            this.updateDeckCards();

        } else {
            this.filterCards();
            this.toggleTabs();

            $('.card').removeClass('lock one');

        }

        this.drawDecks();
    }

    selectTab($tab) {
        $tab.siblings().removeClass('selected');
        $tab.addClass('selected');

        $('.class-bg')
            .removeClass('warrior warlock paladin mage priest rogue shaman hunter druid neutral')
            .addClass($tab.data('clas'));

        this.page = 0;

        this.drawCards();
    }

    updateDeckCards() {
        const $cards = $('.deck-cards');

        const cards = [];

        const ids = this.activeDeck.cardIds;

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
        }

        cards.forEach(card => {
            new Image().src = H.makeCardUrl(card.card.pic);
        });

        this.removeCardPreview();

        render($cards, 'card-lines', { cards: cards });

        $('.card-count .number').text(this.activeDeck.cardIds.length + '/30');

        $('.hero-right-panel').toggleClass('full', this.activeDeck.cardIds.length === 30);
    }

    removeDeck(removeId) {
        H.decks = H.decks.filter(deck => deck.id !== removeId);
        H.saveDecks();
        this.drawDecks();
    }

    sortCards(deck) {
        deck.cardIds = deck.cardIds.sort((cardId1, cardId2) => {
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
