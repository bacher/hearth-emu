
new H.Screen({
    gClass: 'c',
    name: 'collection',
    hash: 'collection',
    draw: function() {

        var decks = JSON.parse(localStorage.getItem('decks')) || [];
        var page = 0;
        var heroMode = false;
        var activeDeck = null;
        var $cardToRemove = null;

        var showCardsBase;
        var showCards;

        render($app, 'collection');

        selectTab($('.tab.druid'));

        drawDecks();

        $app
            .on('click', '.new-deck', () => {
                $('.create-deck-screen').addClass('show');
            })
            .on('click', '.tab', e => {
                const $tab = $(e.currentTarget);

                selectTab($tab);
            })
            .on('click', '.my-decks .deck', e => {
                const $deck = $(e.currentTarget);
                const id = $deck.data('id');

                const deck = _.find(decks, deck => deck.id === id);

                switchMode(deck, $deck);
            })
            .on('click', '.card:not(.lock)', e => {
                if (activeDeck && activeDeck.cards.length < 30) {
                    activeDeck.cards.push($(e.currentTarget).data('id'));

                    saveDecks();

                    checkLimits();

                    updateDeckCards();
                }
            })
            .on('click', '.btn-back', () => {
                if (heroMode) {
                    activeDeck.label = $('.label-edit').val();
                    saveDecks();

                    switchMode(null);
                } else {
                    H.activateScreen('main-menu');
                }
            })
            .on('click', '.scroll-zone.left', () => {
                page--;

                drawCards();
            })
            .on('click', '.scroll-zone.right', () => {
                page++;

                drawCards();
            })
            .on('click', '.card-line', e => {
                const $cardLine = $(e.currentTarget);

                const id = $cardLine.data('id');

                const index = activeDeck.cards.indexOf(id);
                activeDeck.cards.splice(index, 1);

                saveDecks();

                checkLimits();
                updateDeckCards();
            })
            .on('click', '.deck .remove', e => {
                $cardToRemove = $(e.currentTarget).parent();
                $('.confirm').show();

                e.stopPropagation();
            })
            .on('click', '.confirm .ok', () => {
                removeDeck($cardToRemove.data('id'));
                $('.confirm').hide();
            })
            .on('click', '.confirm .cancel', () => {
                $('.confirm').hide();
            })
            .on('click', '.hero', e => {
                const $hero = $(e.currentTarget);

                $hero.siblings().removeClass('selected');
                $hero.addClass('selected');

                $('.avatar').removeClass().addClass('avatar').addClass($hero.data('clas'));

                $('.choose').addClass('show');
            })
            .on('click', '.choose', () => {
                $('.create-deck-screen').removeClass('show');

                const clas = $('.hero.selected').data('clas');

                decks.push({
                    label: 'Custom ' + clas[0].toUpperCase() + clas.substr(1),
                    clas: clas,
                    cards: [],
                    id: Math.floor(Math.random() * 10000)
                });

                saveDecks();

                switchMode(decks[decks.length - 1]);
            })
            .on('click', '.create-deck-screen .back', () => {
                $('.create-deck-screen').removeClass('show');
                $('.hero.selected').removeClass('selected');
                $('.avatar').removeClass().addClass('avatar');
                $('.choose').removeClass('show');
            })
            .on('focusout', '.search', () => {
                filterCards();

                drawCards();
            })
            .on('keydown', '.search', e => {
                if (e.which === 13) {
                    $(e.currentTarget).blur();
                }
            });

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

            makeBaseFiltering();

            drawCards();
        });

        function makeBaseFiltering() {
            showCardsBase = [];

            for (var i = 0; i < 10; ++i) {
                showCardsBase[i] = H.cards[i].filter(card => !card.flags['uncollectable']);
            }
        }

        function filterCards() {
            const searchQuery = $('.search').val().toLowerCase();

            showCards = showCardsBase.map((cardPack, i) => {
                if (i === 0 || !heroMode || i === H.CLASSES[activeDeck.clas]) {
                    if (searchQuery) {
                        return cardPack.filter(card => _.contains(card.name.toLowerCase(), searchQuery));
                    } else {
                        return cardPack;
                    }
                } else {
                    return [];
                }
            });

            toggleTabs();
        }

        function drawCards() {

            if (!showCardsBase) return;

            const selectedClas = H.CLASSES[$('.tab.selected').data('clas')];

            const cardsPool = (showCards || showCardsBase)[selectedClas];

            const $cards = $('.cards');
            const cards = cardsPool.slice(page * 8, page * 8 + 8);

            $('.scroll-zone.left').toggle(page !== 0);
            $('.scroll-zone.right').toggle(page * 8 + 8 < cardsPool.length);

            $('.cards-empty').toggle(cards.length === 0);

            if (cards.length === 0) {
                $cards.empty();
            } else {
                jade.render($cards[0], 'collection-cards', {
                    cards: cards
                });

                checkLimits();
            }
        }

        function toggleTabs() {
            for (var i = 0; i < 10; ++i) {
                $('.tab.' + H.CLASSES_L[i]).toggle(showCards[i].length > 0);
            }

            if ($('.tab.selected:visible').length === 0) {
                selectTab($('.tab:visible:eq(0)'));
            } else {
                $('.tab.selected').removeClass('.selected');
            }
        }

        function drawDecks() {
            jade.render($('.decks-wrapper')[0], 'decks', { decks: decks });
        }

        function checkLimits() {
            if (heroMode && activeDeck) {
                $('.card').each(function() {
                    const $card = $(this);
                    const id = $card.data('id');

                    const alreadyInDeck = activeDeck.cards.filter(cardId => cardId === id).length;

                    $card.removeClass('lock one');
                    if (alreadyInDeck >= 2) {
                        $card.addClass('lock');
                    } else if (alreadyInDeck === 1) {
                        $card.addClass('one');
                    }
                });
            }
        }

        function switchMode(deck, $deck) {
            heroMode = !!deck;
            $('.collection').toggleClass('hero-mode', !!deck);

            activeDeck = deck || null;

            if (deck) {
                filterCards();

                const $deckInfo = $deck.clone();
                $deckInfo.append($('<INPUT>').addClass('label-edit').val($deck.find('.label').text()));

                $('.hero-right-panel .deck-info').html($deckInfo);

                drawCards();
            } else {
                $('.tab').show();

                $('.card').removeClass('lock one');
            }

            if (heroMode) {
                updateDeckCards();
            } else {
                drawDecks();
            }
        }

        function selectTab($tab) {
            $tab.siblings().removeClass('selected');
            $tab.addClass('selected');

            $('.class-bg')
                .removeClass('warrior warlock paladin mage priest rogue shaman hunter druid neutral')
                .addClass($tab.data('clas'));

            page = 0;

            drawCards();
        }

        function updateDeckCards() {
            const $cards = $('.deck-cards');

            render($cards, 'card-lines', { cards: activeDeck.cards.map(cardId => H.cardsHash[cardId]) });
        }

        function saveDecks() {
            localStorage.setItem('decks', JSON.stringify(decks));
        }

        function removeDeck(removeId) {
            decks = decks.filter(deck => deck.id !== removeId);
            drawDecks();
        }

    }
});
