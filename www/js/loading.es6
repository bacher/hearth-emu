
new H.Screen({
    gClass: 'l',
    name: 'loading',
    hash: false,
    draw: function() {

        render($app, 'loading');

        const $stone = $app.find('.stone');

        H.loadDecks();

        $.ajax({
            url: 'textures.json'
        }).then(data => {

            var loaded = 0;
            var bad = 0;
            var all = data.length - 1;

            data.forEach(imageName => {
                const img = new Image();

                img.onload = () => {
                    loaded++;
                    check();
                };

                img.onerror = () => {
                    bad++;
                    check();
                };

                img.src = 'textures/' + imageName;
            });

            setTimeout(() => {
                onLoaded();
            }, 2000);

            function check() {
                if (all === loaded + bad) {
                    onLoaded();
                }
            }

            var alreadyCalled = false;

            function onLoaded() {
                if (alreadyCalled) return;

                alreadyCalled = true;

                if (H.checkParam('gobattle')) {
                    H.activateScreen('waiting-opponent');
                } else if (window.location.hash === '#collection') {
                    H.activateScreen('collection');
                } else if (window.location.hash === '#start-game') {
                    H.activateScreen('start-game-menu');
                } else {
                    H.activateScreen('main-menu');
                }
            }
        });

        setTimeout(() => {
            $stone.addClass('glow-1');

            $app.find('.label').addClass('loaded');

        }, 500);

    }
});
