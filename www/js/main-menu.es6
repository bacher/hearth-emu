
new H.Screen({
    gClass: 'm',
    name: 'main-menu',

    draw: function() {
        jade.render($app[0], 'main-menu', {});

        $app
            .on('click', '.play', () => {
                H.activateScreen('waiting-opponent');
            })
            .on('click', '.my-collection', () => {
                H.activateScreen('collection');
            });
    }
});
