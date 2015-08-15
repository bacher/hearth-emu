
window.$app = $('#app');

if (/[?&]gobattle(?:$|&)/.test(window.location.search)) {
    hbe.activateScreen('waiting-opponent');
} else if (window.location.hash === '#collection') {
    hbe.activateScreen('collection');
} else {
    hbe.activateScreen('main-menu');
}
