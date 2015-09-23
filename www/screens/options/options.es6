
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

        for (var optionName in H.options) {
            const $input = this.$node.find('[name="' + optionName + '"]');

            const value = H.options[optionName];

            if ($input.attr('type') === 'checkbox') {
                $input.attr('checked', value);
            } else {
                $input.val(value);
            }
        }
    }

    _bindEventListeners() {
        this.$node
            .on('click', e => {
                if ($(e.target).hasClass('screen')) {
                    this.close();
                }
            });
    }

    close() {
        this.saveOptions();
        this.hideThenDestroy();
    }

    saveOptions() {
        const options = {};

        this.$node.find('INPUT').each((i, node) => {
            const $node = $(node);
            const name = $node.attr('name');

            var value;

            if ($node.attr('type') === 'checkbox') {
                value = $node.is(':checked');
            } else {
                value = $node.val();
            }

            options[name] = value;
        });

        H.options = options;

        window.localStorage.setItem('options', JSON.stringify(options));
    }

};
