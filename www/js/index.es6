
window.$app = $('#app');

if (/[?&]gobattle(?:$|&)/.test(window.location.search)) {
    hbe.createWaitBattleScreen();
} else if (window.location.hash === '#collection') {
    hbe.createCollectionScreen();
} else {
    hbe.createMainMenuScreen();
}
