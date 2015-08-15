
window.$app = $('#app');

hbe.createMainMenuScreen = function() {
    window.location.hash = '#';

    jade.render($app[0], 'main-menu', {});

    $app.removeClass('c b w');
    $app.addClass('m');

    $app
        .off()
        .on('click', '.play', e => {
            hbe.createWaitBattleScreen();
        })
        .on('click', '.my-collection', e => {
            hbe.createCollectionScreen();
        });
};

if (/[?&]gobattle[&$]/.test(window.location.search)) {
    hbe.createWaitBattleScreen();
} else if (window.location.hash === '#collection') {
    hbe.createCollectionScreen();
} else {
    hbe.createMainMenuScreen();
}
