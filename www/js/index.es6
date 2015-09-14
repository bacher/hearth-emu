
H.app = new H.Application();

H.app.fitScreen();
H.app.activateScreen('loading');

$(document).on('keyup', e => {
    if (e.which === H.KEYS.escape && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (!H.disableMenu) {
            if (H.gameMenu && !H.gameMenu.closed) {
                H.gameMenu.close();
            } else {
                H.gameMenu = H.app.activateOverlay('game-menu');
            }
        }
    }
});

