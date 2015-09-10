
H.loadedCardImages = [];

new H.Screen({
    gClass: 'c',
    name: 'collection',
    hash: 'collection',
    draw: function() {
        var page = 0;
        var heroMode = false;
        var activeDeck = null;
        var $cardToRemove = null;
        var $previewImage = null;

        var showCardsBase;
        var showCards;

        var costFilter = null;

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

                const deck = _.find(H.decks, deck => deck.id === id);

                switchMode(deck);
            })
            .on('click', '.card:not(.lock)', e => {
                if (activeDeck && activeDeck.cardIds.length < 30) {
                    activeDeck.cardIds.push($(e.currentTarget).data('id'));

                    sortCards(activeDeck);

                    H.saveDecks();

                    checkLimits();

                    updateDeckCards();
                }
            })
            .on('click', '.btn-back', () => {
                if (heroMode) {
                    activeDeck.label = $('.label-edit').val();
                    H.saveDecks();

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

                const index = activeDeck.cardIds.indexOf(id);
                activeDeck.cardIds.splice(index, 1);

                H.saveDecks();

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

                const clas = $hero.data('clas');

                $('.avatar')
                    .removeClass()
                    .addClass('avatar')
                    .addClass(H.CLASSES_L[clas]);

                $('.hero-details .label').text(H.HERO_NAMES[clas]);

                $('.choose').addClass('show');
            })
            .on('click', '.choose', () => {
                $('.create-deck-screen').removeClass('show');

                const clas = $('.hero.selected').data('clas');
                const className = H.CLASSES_L[clas];

                H.decks.push({
                    label: 'Custom ' + className[0].toUpperCase() + className.substr(1),
                    clas: clas,
                    cardIds: [],
                    id: Math.floor(Math.random() * 10000)
                });

                H.saveDecks();

                drawDecks();

                switchMode(H.decks[H.decks.length - 1]);
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
            })
            .on('mouseenter', '.card-line', e => {
                const $cardLine = $(e.currentTarget);
                const cardPosition = $cardLine.position();

                if ($previewImage) {
                    $previewImage.remove();
                    $previewImage = null;
                }

                $previewImage = $('<img>')
                    .addClass('card-preview')
                    .attr('src', $cardLine.data('pic'))
                    .css({
                        top: Math.min(268, Math.max(20, cardPosition.top + - 123))
                    })
                    .appendTo($app);
            })
            .on('mouseleave', '.card-line', () => {
                removeCardPreview();
            })
            .on('click', '.mana', e => {
                const $mana = $(e.currentTarget);

                if ($mana.hasClass('selected')) {
                    $mana.removeClass('selected');

                    costFilter = null;

                } else {
                    $('.mana.selected').removeClass('selected');
                    $mana.addClass('selected');

                    costFilter = $mana.data('cost');
                }

                filterCards();
                drawCards();
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

            filterCards();

            drawCards();
        });

        function removeCardPreview() {
            if ($previewImage) {
                $previewImage.remove();
                $previewImage = null;
            }
        }

        function makeBaseFiltering() {
            showCardsBase = [];

            for (var i = 0; i < 10; ++i) {
                showCardsBase[i] = H.cards[i].filter(card => !card.flags['uncollectable']);
            }
        }

        function filterCards() {
            const searchQuery = $('.search').val().toLowerCase();

            showCards = showCardsBase.map((cardPack, i) => {
                var filteredPack = cardPack;

                if (i === 0 || !heroMode || i === activeDeck.clas) {
                    if (searchQuery) {
                        filteredPack = filteredPack.filter(card => _.contains(card.name.toLowerCase(), searchQuery));
                    }

                    if (costFilter !== null) {
                        if (costFilter < 7) {
                            filteredPack = filteredPack.filter(card => card.cost === costFilter);
                        } else {
                            filteredPack = filteredPack.filter(card => card.cost >= 7);
                        }
                    }
                } else {
                    filteredPack = [];
                }

                return filteredPack;
            });

            toggleTabs();
        }

        function drawCards() {
            if (!showCardsBase) { return; }

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
                cards.forEach(card => {
                    if (H.loadedCardImages.indexOf(card.pic) !== -1) {
                        card.loaded = true;
                    }
                });

                render($cards, 'collection-cards', {
                    cards: cards
                });

                cards.forEach((card, i) => {
                    if (!card.loaded) {
                        const img = new Image();

                        const picUrl = 'http://media-hearth.cursecdn.com/avatars/' + card.pic + '.png';

                        img.onload = () => {
                            H.loadedCardImages.push(card.pic);

                            const $card = $cards.find('.card').eq(i);

                            $card.find('.front').attr('src', picUrl);
                            $card.removeClass('loading');
                        };

                        img.src = picUrl;
                    }
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
            render($('.decks-wrapper'), 'decks', { decks: H.decks });
        }

        function checkLimits() {
            if (heroMode && activeDeck) {
                $('.card').each(function() {
                    const $card = $(this);
                    const id = $card.data('id');

                    const alreadyInDeck = activeDeck.cardIds.filter(cardId => cardId === id).length;

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

        function switchMode(deck) {
            heroMode = !!deck;
            $('.collection').toggleClass('hero-mode', !!deck);

            activeDeck = deck || null;

            if (deck) {
                filterCards();

                const $deck = $('.deck[data-id="' + deck.id + '"]');
                const $deckInfo = $deck.clone();
                $deckInfo.append($('<INPUT>').addClass('label-edit').val($deck.find('.label').text()));

                $('.hero-right-panel .deck-info').html($deckInfo);

                updateDeckCards();

            } else {
                filterCards();
                toggleTabs();

                $('.card').removeClass('lock one');

            }

            drawDecks();
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

            const cards = [];

            const ids = activeDeck.cardIds;

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
                new Image().src = H.generatePicUrl(card.card.pic);
            });

            removeCardPreview();

            render($cards, 'card-lines', { cards: cards });

            $('.card-count .number').text(activeDeck.cardIds.length + '/30');

            $('.hero-right-panel').toggleClass('full', activeDeck.cardIds.length === 30);
        }



        function removeDeck(removeId) {
            H.decks = H.decks.filter(deck => deck.id !== removeId);
            H.saveDecks();
            drawDecks();
        }

        function sortCards(deck) {
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

    }
});
