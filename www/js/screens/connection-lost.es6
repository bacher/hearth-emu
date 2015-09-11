
new H.Screen({
    gClass: 'cl',
    name: 'connection-lost',
    hash: '',
    draw: function() {
        $app.empty();

        $app.on('click', () => {
            window.location.reload();
        });
    }
});
