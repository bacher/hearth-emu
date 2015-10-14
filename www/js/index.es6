
H.sessionId = _.random(0, 10000000);

H.loadOptions();

H.app = new H.Application();

if (H.options['scale']) {
    H.app.fitScreen();
}

H.app.activateScreen('loading');


$(document).on('keyup', e => {
    if (e.which === H.KEYS.escape && !e.metaKey && !e.ctrlKey && !e.altKey) {
        H.toggleMenu();
    }
});

$('BODY').append($('<DIV>').addClass('settings-btn').on('click', () => {
    H.toggleMenu();
}));

if (H.options['fullscreen']) {
    $(document).on('mousedown', () => {
        document.body.webkitRequestFullscreen();
    });
}

function iAmAlive() {
    $.ajax({
        url: '/iamalive.json?id=' + H.sessionId,
        method: 'POST'
    });
}

iAmAlive();
setInterval(iAmAlive, 30000);
