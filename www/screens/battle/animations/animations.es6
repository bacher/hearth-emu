
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
                case 'heal':
                    return this._startSplashAnimation(animation);
                case 'fatigue':
                    return this._startFatigueAnimation(animation);

                case 'fireball':
                case 'arrow':
                    return this._startProjectiveAnimation(animation);

                case 'lightning-bolt':
                    return this._startLightningBoltAnimation(animation);

                case 'play-secret':
                    return this._startPlaySecretAnimation(animation);

                default:
                    console.warn('Animation [' + animation.name + '] not implemented!', animation);
            }

            return Promise.resolve();
        }));
    }

    _startHitAnimation(animation) {
        return new Promise(resolve => {
            const $by = this._getNodeById(animation.by);
            const $to = this._getNodeById(animation.to);

            $by.removeClass('available');

            const toPosition = $to.offset();
            const pos = {};

            if ($by.hasClass('avatar')) {
                const byPosition = $by.offset();
                pos.x = toPosition.left - byPosition.left;
                pos.y = toPosition.top - byPosition.top;
            } else {
                pos.x = toPosition.left;
                pos.y = toPosition.top;
            }

            $by.css({
                'transform': `translate(${pos.x}px,${pos.y}px)`,
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

    _startSplashAnimation(animation) {
        return new Promise(resolve => {
            const $to = this._getNodeById(animation.to);

            setTimeout(() => {
                this._newSplash($to, animation.name, animation.name === 'damage' ? -animation.amount : animation.amount);

                setTimeout(resolve, 1000);
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

    _startProjectiveAnimation(animation) {
        return new Promise(resolve => {
            var $by;

            if (animation.by) {
                $by = this._getNodeById(animation.by);
            } else {
                $by = this.$node.find('.avatar.my');
            }

            const byPos = $by.offset();

            animation.to.forEach(targetId => {
                const $to = this._getNodeById(targetId);

                const $projectile = render(null, 'projectile', {
                    addClass: animation.name
                });

                const toPos = $to.offset();

                H.rotateByVector($projectile, byPos.left - toPos.left, byPos.top - toPos.top);

                $projectile.css(byPos);
                $projectile.on('transitionend', () => {
                    $projectile.remove();

                    resolve();
                });

                this.$node.append($projectile);

                setTimeout(() => {
                    $projectile.css(toPos);
                }, 15);
            });
        });
    }

    _startPlaySecretAnimation(animation) {
        return new Promise(resolve => {
            const $splash = render(null, 'secret-splash');
            this.$node.append($splash);

            $splash.on('animationend', () => {
                $splash.remove();
            });

            setTimeout(() => {
                animation.side = animation.player === this._battle.playerId ? 'my' : 'op';

                const $card = render(null, 'secret-card', animation);

                this.$node.append($card);

                $card.on('animationend', () => {
                    $card.remove();

                    resolve();
                });
            }, 300);
        });
    }

    _startLightningBoltAnimation(animation) {
        return new Promise(resolve => {
            const $by = this._getNodeById(animation.by);
            const $to = this._getNodeById(animation.to);

            const byPos = $by.offset();
            const toPos = $to.offset();

            const $bolt = render(null, 'chanel', { clas: 'lightning-bolt' });

            $bolt.css(this._getCenter($by));

            H.rotateByVector($bolt, byPos.left - toPos.left, byPos.top - toPos.top);

            setTimeout(() => {
                $bolt.remove();
                resolve();
            }, 700);

            this.$node.append($bolt);
        });
    }

    _getCenter($obj) {
        const pos = $obj.offset();

        pos.left += $obj.width() / 2;
        pos.top += $obj.height() / 2;

        return pos;
    }

    _parseSide(player) {
        return player === this._battle.playerId ? 'my' : 'op';
    }

    _newSplash($node, className, damage) {
        const $splash = render(null, 'splash', { damage, className });

        $splash.appendTo($node);

        $splash.on('animationend', () => {
            $splash.remove();
        });
    }

    _getNodeById(id) {
        return this.$node.find(`[data-id="${id}"]`);
    }
};
