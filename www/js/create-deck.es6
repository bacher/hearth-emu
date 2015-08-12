
hbe.createDeckScreen = () => {

    jade.render($('#app')[0], 'create-deck', {});

    $('#app')
        .removeClass('w b')
        .addClass('c');

    $.ajax({
        url: '/cards.json'
    }).then(data => {
        hbe.cards = data.cards;

        drawCards();
    });

    $('BODY')
        .on('click', '.card', e => {

            const $container = $('<DIV>');
            jade.render($container[0], 'line-card', {});

            $('.cards-wrapper').append($container);

        })
        .on('click', '.tab:not(.active)', e => {
            console.log(33);
        })
        .on('click', '.btn-ok', e => {

        });


    function drawCards() {
        jade.render($('.card-list')[0], 'card', hbe.cards[0]);
    }

};
