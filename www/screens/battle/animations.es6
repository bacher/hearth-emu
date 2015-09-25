
H.Animations = class Animations {
    constructor(battle, animations) {
        this._battle = battle;
        this.$node = battle.$node;
        this.animations = animations;
    }

    play() {
        return Promise.all(this.animations.map(animation => {
            switch (animation.name) {
                case 'hit':
                    return this._startHitAnimation(animation);

                case 'play-card':
                    if (animation.player === this._battle.enemyPlayerId) {
                        return this._startPlayCardAnimation(animation);
                    }
                    break;
                case 'damage':
                    return this._startDamageAnimation(animation);
            }

            return Promise.resolve();
        }));
    }

    _startHitAnimation(animation) {
        return new Promise(resolve => {
            const $by = this._getNodeById(animation.by);
            const $to = this._getNodeById(animation.to);

            const byPosition = $by.offset();
            const toPosition = $to.offset();
            const deltaX = toPosition.left - byPosition.left;
            const deltaY = toPosition.top - byPosition.top;

            $by.css('transform', `translate(${deltaX}px,${deltaY}px)`);

            setTimeout(() => {
                $by.css('transform', '');

                setTimeout(resolve, 1000);
            }, 200);
        });
    }

    _startPlayCardAnimation(animation) {
        return new Promise(resolve => {
            const $card = render(null, 'card', {
                id: '',
                cost: animation.card.cost,
                pic: animation.card.pic,
                cardWrapClass: 'play-card-preview'
            });

            $card.appendTo(this.$node);

            $card.on('animationend', () => {
                $card.remove();
            });

            setTimeout(resolve, 100);
        });
    }

    _startDamageAnimation(animation) {
        return new Promise(resolve => {
            const $to = this._getNodeById(animation.to);
            setTimeout(() => {
                this._newSplash($to.offset(), animation.amount);

                setTimeout(resolve, 2000);
            }, 200);
        });
    }

    _newSplash(position, damage) {
        const $splash = render(null, 'splash', { damage });

        $splash.css(position);

        $splash.appendTo(this.$node);

        $splash.on('animationend', () => {
            $splash.remove();
        });
    }

    _getNodeById(id) {
        return this.$node.find(`[data-id="${id}"]`);
    }
};
