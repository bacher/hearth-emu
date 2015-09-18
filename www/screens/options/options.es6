
H.Screens['options'] = class OptionsScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'o',
            name: 'options',
            hash: false
        });
    }

    _render() {
        render(this.$node, 'options');
    }

    _bindEventListeners() {
        this.$node.on('click', e => {
            if (!e.isDefaultPrevented()) {
                this.hideThenDestroy();
            }
        });
    }

};
