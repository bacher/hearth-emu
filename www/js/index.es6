
H.app = new H.Application();

H.app.fitScreen();
H.app.activateScreen('loading');


$(document).on('keyup', e => {
    if (e.which === H.KEYS.escape && !e.metaKey && !e.ctrlKey && !e.altKey) {
        H.toggleMenu();
    }
});

$('BODY').append($('<DIV>').addClass('settings-btn').on('click', () => {
    H.toggleMenu();
}));
