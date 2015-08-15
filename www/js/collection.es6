
hbe.createCollectionScreen = function() {

    window.location.hash = '#collection';

    const decks = JSON.parse(localStorage.getItem('decks')) || [];
    var page = 0;
    var heroMode = false;
    var activeDeck = null;

    jade.render($app[0], 'collection', {});

    drawDecks();

    $app
        .removeClass('m w b')
        .addClass('c')
        .off()
        .on('click', '.new-deck', () => {
            $('.create-deck-screen').addClass('show');
        })
        .on('click', '.tab', e => {
            const $tab = $(e.currentTarget);

            selectTab($tab);
        })
        .on('click', '.btn-done', () => {
            switchMode(null);
        })
        .on('click', '.deck', e => {
            const $deck = $(e.currentTarget);
            const id = $deck.data('id');

            const deck = _.find(decks, deck => deck.id === id);

            switchMode(deck);
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
            hbe.createMainMenuScreen();
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
        .on('click', '.hero', e => {
            const $hero = $(e.currentTarget);

            $hero.siblings().removeClass('selected');
            $hero.addClass('selected');

            $('.choose').addClass('show');
        })
        .on('click', '.choose', () => {
            $('.create-deck-screen').removeClass('show');

            decks.push({
                label: 'Custom Shaman',
                clas: 'shaman',
                cards: [],
                id: Math.floor(Math.random() * 10000)
            });

            saveDecks();

            switchMode(decks[decks.length - 1]);
        });

    $.ajax({
        url: '/cards.json'
    }).then(data => {
        hbe.cards = {
            all: data.cards,
            [hbe.CLASSES.neutral]: [],
            [hbe.CLASSES.warrior]: [],
            [hbe.CLASSES.shaman]: [],
            [hbe.CLASSES.rogue]: [],
            [hbe.CLASSES.paladin]: [],
            [hbe.CLASSES.hunter]: [],
            [hbe.CLASSES.druid]: [],
            [hbe.CLASSES.warlock]: [],
            [hbe.CLASSES.mage]: [],
            [hbe.CLASSES.priest]: []
        };

        hbe.cardsHash = {};

        data.cards.forEach(card => {
            hbe.cards[card.clas].push(card);
            hbe.cardsHash[card.id] = card;
        });

        drawCards();
    });

    function drawCards() {
        const $cards = $('.cards');
        const selectedClas = hbe.CLASSES[$('.tab.selected').data('clas')];

        const cardsPool = hbe.cards[selectedClas];
        const drawCards = cardsPool.slice(page * 8, page * 8 + 8);

        $('.arrow.left').toggle(page !== 0);
        $('.arrow.right').toggle(page * 8 + 8 < cardsPool.length);

        jade.render($cards[0], 'collection-cards', {
            cards: drawCards
        });

        checkLimits();
    }

    function drawDecks() {
        jade.render($('.decks-wrapper')[0], 'decks', { decks: decks });
    }

    function checkLimits() {
        if (heroMode) {
            $('.card').each(function() {
                const id = $(this).data('id');

                const alreadyInDeck = activeDeck.cards.filter(cardId => cardId === id).length;

                if (alreadyInDeck >= 2) {
                    $(this).addClass('lock');
                } else if (alreadyInDeck === 1) {
                    $(this).addClass('one');
                }
            });
        }
    }

    function switchMode(deck) {
        heroMode = !!deck;
        $('.collection').toggleClass('hero-mode', !!deck);

        if (deck) {
            $('.tab:not(.neutral)').hide();
            const $classTab = $('.tab.' + deck.clas);
            $classTab.show();

            selectTab($classTab);

            drawCards();
        } else {
            $('.tab').show();
        }

        activeDeck = deck;

        updateDeckCards();
    }

    function selectTab($tab) {
        $tab.siblings().removeClass('selected');
        $tab.addClass('selected');

        page = 0;

        drawCards();
    }

    function updateDeckCards() {
        const $cards = $('.deck-cards');

        jade.render($cards[0], 'card-lines', { cards: activeDeck.cards.map(cardId => hbe.cardsHash[cardId]) });
    }

    function saveDecks() {
        localStorage.setItem('decks', JSON.stringify(decks));
    }

};
