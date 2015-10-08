
H.Screens['menu'] = class MenuScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'm',
            name: 'menu',
            hash: false
        });
    }

    _render() {
        render(this.$node, 'menu', {
            items: this.getItems()
        });
    }

    _bindEventListeners() {
        this.$node
            .on('click', e => {
                if (!e.isDefaultPrevented()) {
                    this.close();
                }
            })
            .on('click', '.game-menu', e => {
                e.preventDefault();
            })
            .on('click', '.btn', (e) => {
                this.close();
                this.onSelect($(e.currentTarget).data('id'));
            });
    }

    close() {
        this.closed = true;

        this.hideThenDestroy();
    }
};
