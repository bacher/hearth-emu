
new H.Screen({
    gClass: 'm',
    name: 'main-menu',

    draw: function() {
        render($app, 'main-menu');

        $app
            .on('click', '.play', () => {
                H.activateScreen('start-game-menu');
            })
            .on('click', '.my-collection', () => {
                H.activateScreen('collection');
            });

        setTimeout(function() {
            $app.find('.disk').addClass('ready');
            $app.find('.footer').addClass('ready');
        }, 1500);
    }
});
