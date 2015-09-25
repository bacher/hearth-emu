
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
                case 'use-hero-skill':
                    if (animation.player === this._battle.enemyPlayerId) {
                        return this._startHeroSkillAnimation(animation);
                    }
                    break;
                case 'damage':
                    return this._startDamageAnimation(animation);
                case 'fatigue':
                    return this._startFatigueAnimation(animation);
            }

            return Promise.resolve();
        }));
    }

    _startHitAnimation(animation) {
        return new Promise(resolve => {
            const $by = this._getNodeById(animation.by);
            const $to = this._getNodeById(animation.to);

            $by.removeClass('available');

            const byPosition = $by.offset();
            const toPosition = $to.offset();
            const deltaX = toPosition.left - byPosition.left;
            const deltaY = toPosition.top - byPosition.top;

            $by.css({
                'transform': `translate(${deltaX}px,${deltaY}px)`,
                'z-index': 1
            });

            setTimeout(() => {
                $by.css({
                    'transform': '',
                    'z-index': ''
                });

                setTimeout(resolve, 600);
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

    _startFatigueAnimation(animation) {
        return new Promise(resolve => {
            const $newCard = render(null, 'fatigue-card', {
                side: this._parseSide(animation.player),
                damage: animation.damage
            });

            this.$node.find('.new-cards').append($newCard);

            setTimeout(() => {
                $newCard.addClass('up');

                setTimeout(() => {
                    $newCard.removeClass('up');
                    $newCard.addClass('big-center');

                    setTimeout(() => {
                        $newCard.remove();
                        resolve();
                    }, 1800);
                }, 400)
            }, 100);
        });
    }

    _startHeroSkillAnimation(animation) {
        return new Promise(resolve => {
            const $card = render(null, 'hero-skill-card');

            $card.appendTo(this.$node);

            $card.on('animationend', () => {
                $card.remove();
            });

            setTimeout(resolve, 100);
        });
    }

    _parseSide(player) {
        return player === this._battle.playerId ? 'my' : 'op';
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
