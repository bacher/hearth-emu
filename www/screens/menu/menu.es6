
H.Screens['menu'] = class MenuScreen extends H.Screen {
    constructor(params = {}) {
        super({
            gClass: 'm',
            name: 'menu',
            hash: false
        });

        this.position = params.position;
    }

    _render() {
        render(this.$node, 'menu', {
            items: this.getItems()
        });

        if (this.position) {
            this.$node.find('.menu').css({
                top: this.position.y,
                left: this.position.x
            });
        }
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
