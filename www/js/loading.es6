
new Screen({
    gClass: 'l',
    name: 'loading',
    hash: false,
    draw: function() {

        render($app, 'loading');

        const $stone = $app.find('.stone');

        $.ajax({
            url: 'textures/textures.json'
        }).then(data => {
            data.forEach(imageName => {
                if (imageName) {
                    const img = new Image();

                    img.onload = () => {

                    };

                    img.onerror = () => {

                    };

                    img.src = 'textures/' + imageName;
                }
            });
        });

        setTimeout(() => {
            $stone.addClass('glow-1');

            $app.find('.label').addClass('loaded');

        }, 500);

        setTimeout(() => {
            if (checkParam('gobattle')) {
                hbe.activateScreen('waiting-opponent');
            } else if (window.location.hash === '#collection') {
                hbe.activateScreen('collection');
            } else {
                hbe.activateScreen('main-menu');
            }
        }, 1000);

    }
});
