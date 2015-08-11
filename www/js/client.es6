
const hbe = {};

jade.render($('#app')[0], 'main-menu', {});

$('BODY')
    .on('click', '.btn-create-deck', e => {
        hbe.createDeckScreen();
    })
    .on('click', '.btn-play-battle', e => {
        hbe.battleScreen();
    });
