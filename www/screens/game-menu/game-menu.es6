
const Menu = H.Screens['menu'];

H.Screens['game-menu'] = class GameMenuScreen extends Menu {
    getItems() {
        var items = [
            { id: 'options', label: 'Options' },
            { id: 'quit', label: 'Quit' },
            'splitter',
            { id: 'resume', label: 'Resume' }
        ];

        if (H.app.getActiveScreen().name === 'battle') {
            items = [
                { id: 'concede', label: 'Concede' },
                'splitter'
            ].concat(items);
        }

        return items;
    }

    _onShow() {
        $('.settings-btn').addClass('active');
    }

    _onHide() {
        $('.settings-btn').removeClass('active');
    }

    onSelect(id) {
        switch (id) {
            case 'concede':
                H.app.getActiveScreen().concede();
                break;

            case 'options':
                H.app.activateOverlay('options');
                break;

            case 'quit':
                window.location = '/';
                break;
        }
    }
};
