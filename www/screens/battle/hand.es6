
H.Hand = class Hand {
    constructor(battle) {
        this._battle = battle;

        this.$node = battle.$node.find('.hand.my');
        this.$opNode = battle.$node.find('.hand.op');

        this._render();

        this._bindEventListeners();
    }

    _render() {
        render(this.$node, 'hand');
        render(this.$opNode, 'op-hand');

        this._$cards = this.$node.find('.cards');
        this._$opCards = this.$opNode.find('.cards');

        this._$cardPreview = this.$node.find('.card-preview');
    }

    _bindEventListeners() {
        this.$node
            .on('mouseenter', '.hand.my .card-wrap', e => {
                const $cardWrap = $(e.currentTarget);
                const $img = $cardWrap.find('IMG');
                const picUrl = $img.attr('src');

                this._$cardPreview.find('IMG').attr('src', picUrl);
                this._$cardPreview
                    .toggleClass('available', $cardWrap.hasClass('available'))
                    .toggleClass('combo-mode', $cardWrap.hasClass('combo-mode'))
                    .show();
            })
            .on('mouseleave', '.card-wrap', () => {
                this._$cardPreview.hide();
            });
    }

    onGameData(game) {

        this._$cards.empty();

        game.my.hand.forEach((handCard, i) => {
            const $cardWrapper = render(null, 'card', {
                classes: this._extractClasses(handCard, i + 1),
                handCard
            });

            this._$cards.append($cardWrapper);
        });


        const opCardCount = game.op.hand.length;

        this._$opCards.find('.card-wrap').each((i, node) => {
            $(node).toggle(i < opCardCount);
        });

        this._updateHandCountClass(this.$node, game.my.hand.length);
        this._updateHandCountClass(this.$opNode, game.op.hand.length);
    }

    _extractClasses(handCard, i) {
        var classes = handCard.type === H.CARD_TYPES['minion'] ? 'minion' : '';

        for (var flag in handCard.flags) {
            if (flag === 'can-play') {
                flag = 'available';
            }

            classes += ' ' + flag;
        }

        if (handCard.targetsType) {
            classes += 'need-target';
        }

        classes += ' c' + i;

        return classes;
    }

    _updateHandCountClass($hand, count) {
        const newClass = 'hand' + count;

        $hand
            .removeClass($hand.data('hand-class'))
            .addClass(newClass)
            .data('hand-class', newClass);
    }
};
