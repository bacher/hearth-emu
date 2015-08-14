
window.$app = $('#app');

jade.render($app[0], 'main-menu', {});

$app.addClass('m');

$app
    .on('click', '.play', e => {
        hbe.createWaitBattleScreen();
    })
    .on('click', '.my-collection', e => {
        hbe.createCollectionScreen();
    });

if (/[?&]gobattle[&$]/.test(window.location.search)) {
    hbe.createWaitBattleScreen();
} else if (window.location.hash === '#collection') {
    hbe.createCollectionScreen();
}
