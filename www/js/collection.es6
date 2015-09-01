
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

        render($app, 'collection');

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
            .on('click', '.arrow.left', () => {
                page--;

                drawCards();
            })
            .on('click', '.arrow.right', () => {
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

            drawCards();
        });

        function drawCards() {
            const $cards = $('.cards');
            const selectedClas = H.CLASSES[$('.tab.selected').data('clas')];

            const cardsPool = H.cards[selectedClas];
            const cards = cardsPool.slice(page * 8, page * 8 + 8);

            $('.arrow.left').toggle(page !== 0);
            $('.arrow.right').toggle(page * 8 + 8 < cardsPool.length);

            jade.render($cards[0], 'collection-cards', {
                cards: cards
            });

            checkLimits();
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
                $('.tab:not(.neutral)').hide();
                const $classTab = $('.tab.' + deck.clas);
                $classTab.show();

                const $deckInfo = $deck.clone();
                $deckInfo.append($('<INPUT>').addClass('label-edit').val($deck.find('.label').text()));

                $('.hero-right-panel .deck-info').html($deckInfo);

                selectTab($classTab);

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
