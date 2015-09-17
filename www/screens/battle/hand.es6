
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

    _getCardById(id) {
        return this._$cards.find('[data-id="' + id + '"]');
    }

    onGameData(game) {

        const isFirstFill = !this._prevGame;

        const prevHand = this._prevGame ? this._prevGame.my.hand : [];
        const hand = game.my.hand;

        prevHand.forEach(handCard => {
            const card = _.find(hand, { id: handCard.id });

            if (!card) {
                this._getCardById(handCard.id).remove();
            }
        });

        hand.forEach((handCard, i) => {
            var $card;

            const card = _.find(prevHand, { id: handCard.id });

            if (card) {
                $card = this._getCardById(card.id);

            } else {
                $card = render(null, 'card', {
                    handCard
                });

                if (!isFirstFill) {
                    $card.hide();
                }

                this._$cards.append($card);

                if (!isFirstFill) {
                    const $newCard = $('<div>').addClass('new-card');
                    $newCard.append($card.children().clone());

                    this._battle.$node.find('.new-cards').append($newCard);

                    setTimeout(() => {
                        $newCard.addClass('up');
                        setTimeout(() => {
                            $newCard.removeClass('up');
                            $newCard.addClass('big');

                            setTimeout(() => {
                                $newCard.removeClass('big');
                                $newCard.addClass('in-hand');

                                setTimeout(() => {
                                    $newCard.remove();
                                    $card.show();
                                }, 500);
                            }, 1800);
                        }, 400)
                    }, 100);
                }
            }

            this._updateClasses($card, handCard, i);

        });


        const opCardCount = game.op.hand.length;

        this._$opCards.find('.card-wrap').each((i, node) => {
            $(node).toggle(i < opCardCount);
        });

        this._updateHandCountClass(this.$node, game.my.hand.length);
        this._updateHandCountClass(this.$opNode, game.op.hand.length);

        this._prevGame = game;
    }

    _updateClasses($card, handCard, i) {
        var classes = 'card-wrap';

        if (handCard.type === H.CARD_TYPES['minion']) {
            classes += ' minion';
        }

        for (var flag in handCard.flags) {
            if (flag === 'can-play') {
                flag = 'available';
            }

            classes += ' ' + flag;
        }

        if (handCard.targetsType) {
            classes += ' need-target';
        }

        classes += ' c' + (i + 1);

        $card.get(0).className = classes;
    }

    _updateHandCountClass($hand, count) {
        const newClass = 'hand' + count;

        $hand
            .removeClass($hand.data('hand-class'))
            .addClass(newClass)
            .data('hand-class', newClass);
    }
};
