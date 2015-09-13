
H.PlayCard = class PlayCard {
    constructor(battle) {
        this.battle = battle;

        this.$node = battle.$node;

        this._$clickCard = null;
        this._$grabCard = null;
        this._$arrow = this.$node.find('.arrow');

        this._mouse = null;

        this._onMouseDown = this._addUpdateMouseWrap(this._onMouseDown);
        this._onMouseMove = this._addUpdateMouseWrap(this._onMouseMove);
        this._onMouseUp = this._addUpdateMouseWrap(this._onMouseUp);

        this._arrowMode = false;
        this._targeting = false;

        this.$node.addClass('normal-mode');

        this._arrowBasePosition = {
            x: 644,
            y: 720 - 167
        };

        this.PLAY_CARD_HEIGHT = 575;
    }

    bindEventListeners() {
        // FIXME How unbind?
        H.socket.on('targets', this._setPurposes.bind(this));

        this.$node
            .on('mousedown', '.card-wrap', this._ifActiveWrap(this._onMouseDown));
    }

    _onMouseDown(e) {
        if (!this._targeting) {
            this._$clickCard = $(e.currentTarget);

            this.$node
                .on('mousemove', this._onMouseMove)
                .on('mouseup', this._onMouseUp);
        }
    }

    _onMouseMove(e) {
        window.p = e;
        if (this._targeting) {
            if (this._mouse.y < this.PLAY_CARD_HEIGHT) {
                if (this._isCardPlayable) {
                    if (this._needTarget) {
                        if (!this._arrowMode) {
                            this._$grabCard.hide();
                            this._toggleAimTargeting(true);
                        }

                        this._toggleCrosshair($(e.target).closest('.purpose').length > 0);

                    } else {
                        this._$grabCard.addClass('blue-glow');
                    }
                } else {
                    this._showErrorMessage();
                    this._release(true);
                    return;
                }

            } else {
                if (this._needTarget) {
                    if (this._arrowMode) {
                        this._toggleAimTargeting(false);
                        this._$grabCard.show();
                    }
                } else {
                    this._$grabCard.removeClass('blue-glow');
                }
            }

            this._updateDragItemPosition();

        } else {
            this._grabCard();
        }
    }

    _onMouseUp(e) {
        if (this._targeting) {
            if (this._needTarget) {
                const $targetPurpose = $(e.target).closest('.purpose');

                if ($targetPurpose.length) {
                    this._$targetPurpose = $targetPurpose;

                    this._release();
                }

            } else {
                this._release();
            }

        } else {
            this._grabCard();
        }
    }

    _release(isCancel) {
        this.$node
            .off('mousemove', this._onMouseMove)
            .off('mouseup', this._onMouseUp);

        if (!isCancel && this._mouse.y < this.PLAY_CARD_HEIGHT) {
            this._playCard();

        } else {
            this._$clickCard.show();
        }

        this._toggleAimTargeting(false);

        this._targeting = false;
        this._$clickCard = null;
        this._$targetPurpose = null;
        this._$grabCard.remove();
        this._$grabCard = null;
    }

    _grabCard() {
        this._targeting = true;
        this._$grabCard = this._$clickCard.clone().addClass('grab-card');
        this._needTarget = this._$grabCard.hasClass('need-target');
        this._isCardPlayable = this._$grabCard.hasClass('available');

        this._$clickCard.hide();

        this._updateDragItemPosition();

        this._$grabCard.appendTo(this.$node);
    }

    _updateDragItemPosition() {
        if (this._arrowMode) {

            const dX = this._arrowBasePosition.x - this._mouse.x;
            const dY = this._arrowBasePosition.y - this._mouse.y;

            const distance = Math.sqrt(dX * dX + dY * dY);

            var angle = Math.atan(dX / dY);

            if (dY < 0) {
                angle = angle + Math.PI;
            }

            this._$arrow
                .height(distance)
                .css('transform', 'rotate(' + -angle + 'rad)');

        } else {
            const x = this._mouse.x - 40;
            const y = this._mouse.y - 50;

            this._$grabCard.css({
                top: y,
                left: x
            });
        }
    }

    _playCard() {
        const playCardData = {
            id: this._$grabCard.data('id')
        };

        if (this._needTarget) {
            playCardData.target = this._$targetPurpose.data('id');
            playCardData.side = this._$targetPurpose.closest('.creatures').hasClass('my') ? 'my' : 'op';
        }

        H.socket.send('play-card', playCardData);
    }

    _ifActiveWrap(callback) {
        const battle = this.battle;
        return function() {
            if (battle.battleData.my.active) {
                callback.apply(this, arguments);
            }
        };
    }

    _toggleAimTargeting(enable) {
        this.$node.toggleClass('arrow-mode', enable);
        this.$node.toggleClass('normal-mode', !enable);

        this._$arrow.toggle(enable);

        this._arrowMode = enable;

        if (enable) {
            this._$arrow.css({
                bottom: 720 - this._arrowBasePosition.y,
                left: this._arrowBasePosition.x
            });

            H.socket.send('get-targets', {
                cardId: this._$grabCard.data('id')
            });
        } else {
            this._$arrow.removeClass('with-crosshair');
        }
    }

    _showErrorMessage() {
        window.alert('BAD MOVE');
    }

    _addUpdateMouseWrap(method) {
        const that = this;

        return function(e) {
            that._mouse = {
                x: e.pageX,
                y: e.pageY
            };

            return method.apply(that, arguments);
        };
    }

    _setPurposes(data) {
        const targetsDetails = data.targets;

        this.$node.find('.purpose').removeClass('purpose');

        if (targetsDetails !== 'not-need') {

            ['my', 'op'].forEach(side => {
                const targets = targetsDetails[side];

                if (targets) {
                    if (targets.hero) {
                        this.$node.find('.avatar.' + side).addClass('purpose');
                    }

                    if (targets.minions) {
                        targets.minions.forEach(minionId => {
                            this.$node.find('.creature[data-id="' + minionId + '"]').addClass('purpose');
                        });
                    }
                }
            });
        }
    }

    _toggleCrosshair(enable) {
        this._$arrow.toggleClass('with-crosshair', enable);
    }

};
