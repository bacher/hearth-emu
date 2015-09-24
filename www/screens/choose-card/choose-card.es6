
H.Screens['choose-card'] = class ChooseCardScreen extends H.Screen {
    constructor(params) {
        super({
            gClass: 'cc',
            name: 'choose-card',
            hash: false
        });

        this.params = params;
    }

    _render() {
        render(this.$node, 'choose-card', this.params);
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.card-select-wrapper', this._onCardSelect.bind(this));

        $(document).on('keydown', e => {
            if (e.which === H.KEYS.escape && !e.metaKey && !e.ctrlKey && !e.altKey) {
                if (this.params.onCancel) {
                    this.params.onCancel();
                }

                this.hideThenDestroy();
            }
        });
    }

    _onShow() {
        this.disableMenu();
    }

    _onCardSelect(e) {
        const $preview = $(e.currentTarget);

        this.params.onSelect($preview.data('index'));

        this.hideThenDestroy();
    }
};
