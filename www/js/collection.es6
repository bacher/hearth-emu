
hbe.createCollectionScreen = () => {

    window.location.hash = '#collection';

    const decks = JSON.parse(localStorage.getItem('decks')) || [];


    jade.render($app[0], 'collection', {});

    drawDecks();

    $app
        .removeClass('m w b')
        .addClass('c');

    $app
        .on('click', '.new-deck', () => {
            $('.create-deck-screen').addClass('show');
        })
        .on('click', '.tab', e => {
            const $tab = $(e.currentTarget);

            $tab.siblings().removeClass('selected');
            $tab.addClass('selected');

            drawCards();
        })
        .on('click', '.btn-back', () => {
            switchMode(null);
        })
        .on('click', '.deck', e => {
            const $deck = $(e.currentTarget);
            const id = $deck.data('id');

            const deck = _.find(decks, deck => deck.id === id);

            switchMode(deck);
        });

    $app
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
        hbe.cards = data.cards;

        drawCards();
    });

    function drawCards() {
        const cards = $('.cards')[0];
        const drawCards = [];

        const selectedClas = hbe.CLASSES[$('.tab.selected').data('clas')];

        for (var i = 0; i < hbe.cards.length; ++i) {
            var card = hbe.cards[i];

            if (card.clas === selectedClas) {
                drawCards.push(card);
            }
        }

        jade.render(cards, 'collection-cards', {
            cards: drawCards
        });
    }

    function drawDecks() {
        jade.render($('.decks-wrapper')[0], 'decks', { decks: decks });
    }

    function switchMode(deck) {
        $('.collection').toggleClass('hero-mode', !!deck);

        if (deck) {
            $('.tab:not(.neutral)').hide();
            $('.tab.' + deck.clas).show();
        } else {
            $('.tab').show();
        }
    }

    function saveDecks() {
        localStorage.setItem('decks', JSON.stringify(decks));
    }

};
