
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

$('BODY')
    .append($('<DIV>').addClass('settings-btn').on('click', () => {
        H.toggleMenu();
    }))
    .append($('<DIV>').addClass('beta').text('BETA'))
    .append($('<DIV>').addClass('feedback').text('Feedback').click(e => {
        const text = prompt('Tell me about your pain:');

        if (text) {
            $.ajax({
                url: '/feedback.json',
                method: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    text: text
                })
            });
        }
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
