
new Screen({
    gClass: 'm',
    name: 'main-menu',

    draw: function() {
        jade.render($app[0], 'main-menu', {});

        $app
            .on('click', '.play', () => {
                hbe.activateScreen('waiting-opponent');
            })
            .on('click', '.my-collection', () => {
                hbe.activateScreen('collection');
            });
    }
});
