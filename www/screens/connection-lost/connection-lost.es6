
H.Screens['connection-lost'] = class ConnectionLostScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'cl',
            name: 'connection-lost',
            hash: ''
        });
    }

    _render() {}

    _onShow() {
        $('.settings-btn').remove();
    }

    _bindEventListeners() {
        this.$node.on('click', () => {
            window.location.reload();
        });
    }
};
