
H.Creatures = class Creatures {
    constructor(battle) {
        this._battle = battle;
        this.$node = battle.$node;

        this._$creatures = this.$node.find('.creatures');

        this._bindEventListeners();
    }

    _bindEventListeners() {
        this.$node.on('mouseenter', '.creature', this._onMouseEnter.bind(this));
        this.$node.on('mouseout', '.creature', this._onMouseOut.bind(this));
    }

    draw() {
        this._$creatures.empty();

        const game = this._battle.battleData;

        ['my', 'op'].forEach(side => {
            const player = game[side];

            const $creatures = this._$creatures.filter('.' + side);

            player.creatures.forEach(minion => {
                var classes = '';
                for (var prop in minion.flags) {
                    classes += ' ';
                    classes += prop;
                }

                if (side === 'my' && minion.flags['can-play']) {
                    classes += ' available';
                }

                $creatures.append(render(null, 'creature', { minion, classes }));
            });
        });
    }

    _onMouseEnter(e) {
        const $minion = $(e.currentTarget);

        this._showDelay = setTimeout(() => {
            const position = $minion.offset();

            position.top -= 90;
            position.left += 80;

            this._$preview = render(null, 'minion-preview', { pic: $minion.find('IMG').attr('src') });

            this._$preview.css(position);

            this.$node.append(this._$preview);
        }, 300);
    }

    _onMouseOut() {
        clearTimeout(this._showDelay);

        if (this._$preview) {
            this._$preview.remove();
            this._$preview = null;
        }
    }
};
