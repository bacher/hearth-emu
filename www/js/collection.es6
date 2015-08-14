
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
                title: 'CustomShaman',
                clas: 'shaman',
                cards: []
            });

            switchMode(decks[0]);
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

};
