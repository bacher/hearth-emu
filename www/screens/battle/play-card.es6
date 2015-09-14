
H.KEYS = {
    escape: 27
};


H.PlayCard = class PlayCard {
    constructor(battle) {
        this.battle = battle;

        this.$node = battle.$node;

        this._$clickObject = null;
        this._$grabCard = null;
        this._$arrow = this.$node.find('.arrow');

        this._mouse = null;

        this._onMouseDown = this._addUpdateMouseWrap(this._onMouseDown);
        this._onMouseMove = this._addUpdateMouseWrap(this._onMouseMove);
        this._onMouseUp = this._addUpdateMouseWrap(this._onMouseUp);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onContextMenu = this._onContextMenu.bind(this);

        this._arrowMode = false;
        this._targeting = false;

        this.$node.addClass('normal-mode');

        this._arrowBasePosition = null;

        this.PLAY_CARD_HEIGHT = 575;
    }

    bindEventListeners() {
        // FIXME How unbind?
        H.socket.on('targets', this._setPurposes.bind(this));

        this.$node
            .on('mousedown', '.my .card-wrap', this._ifActiveWrap(this._onMouseDown))
            .on('mousedown', '.my .creature.available', this._ifActiveWrap(this._onMouseDown))
            .on('mousedown', '.my .hero-skill.need-target.available', this._ifActiveWrap(this._onMouseDown))
            .on('mousedown', '.my .avatar.available', this._ifActiveWrap(this._onMouseDown))
            .on('click', '.my .hero-skill.available:not(.need-target)', () => {
                H.socket.send('use-hero-skill');
            });
    }

    _onKeyDown(e) {
        if (e.which === H.KEYS.escape && !e.metaKey && !e.ctrlKey && !e.altKey) {
            this._release();
        }
    }

    _onContextMenu(e) {
        e.preventDefault();

        this._release();
    }

    _onMouseDown(e) {
        if (!this._targeting) {
            this._$clickObject = $(e.currentTarget);

            this.$node
                .on('mousemove', this._onMouseMove)
                .on('mouseup', this._onMouseUp);

            $(document).on('keydown', this._onKeyDown);
            $(document).on('contextmenu', this._onContextMenu);
        }
    }

    _onMouseMove(e) {
        if (this._targeting) {
            if (this._mouse.y < this.PLAY_CARD_HEIGHT) {

                if (this._isCard && !this._isCardPlayable) {
                    this._showErrorMessage();
                    this._release();
                    return;

                } else {
                    if (this._isCard) {
                        if (this._needTarget) {
                            if (!this._arrowMode) {
                                this._$grabCard.hide();

                                this._toggleAimTargeting(true);
                            }

                            this._toggleCrosshair($(e.target).closest('.purpose').length > 0);

                        } else {
                            this._toggleCardActivation(true);

                            if (this._isMinionCard) {
                                this._shiftMinions();
                            }
                        }
                    } else {
                        this._toggleCrosshair($(e.target).closest('.purpose').length > 0);
                    }
                }

            } else {
                if (this._isCard) {
                    if (this._needTarget) {
                        if (this._arrowMode) {
                            this._toggleAimTargeting(false);
                            this._$grabCard.show();
                        }
                    } else {
                        this._toggleCardActivation(false);
                    }
                } else {
                    this._release();
                    return;
                }
            }

            this._updateDragItemPosition();

        } else {
            this._grabObject();
        }
    }

    _onMouseUp(e) {
        if (this._targeting) {
            if (this._mouse.y < this.PLAY_CARD_HEIGHT) {
                this._tryMakeAction(e);

            } else {
                this._release();
            }
        } else {
            this._grabObject();
        }
    }

    _release(success) {
        this.$node
            .off('mousemove', this._onMouseMove)
            .off('mouseup', this._onMouseUp);

        $(document)
            .off('keydown', this._onKeyDown)
            .off('contextmenu', this._onContextMenu);

        if (this._isBattlecryPreview) {
            this._savedAction._$clickObject.show();
            this._$clickObject.remove();

        } else if (this._isCard) {
            if (!success) {
                this._$clickObject.show();
            }

        } else if (this._isMinion || this._isHero) {
            this._$clickObject.removeClass('find-target');
        }

        this._toggleCardActivation(false);
        this._toggleAimTargeting(false);

        this._clearPurposes();

        this._targeting = false;
        this._$clickObject = null;
        this._$targetPurpose = null;
        this._$arrowBaseObject = null;

        this._isMinionNeedBattleCryTarget = false;

        if (this._isCard) {
            this._$grabCard.remove();
            this._$grabCard = null;
        }
    }

    _grabObject() {
        this._targeting = true;

        this._isCard = this._$clickObject.hasClass('card-wrap');
        this._isMinionCard = this._isCard && this._$clickObject.hasClass('minion');
        this._isMinionNeedBattleCryTarget = this._isMinionCard && this._$clickObject.hasClass('need-battlecry-target');

        this._isMinion = this._$clickObject.hasClass('creature');
        this._isBattlecryPreview = this._isMinion && this._$clickObject.hasClass('battlecry-preview');

        this._isHeroSkill = this._$clickObject.hasClass('hero-skill');
        this._isHero = this._$clickObject.hasClass('avatar');

        if (this._isMinion || this._isHeroSkill || this._isHero) {
            if ((this._isMinion || this._isHero) && !this._isBattlecryPreview) {
                this._$clickObject.addClass('find-target');
            }
            this._$arrowBaseObject = this._$clickObject;

            this._toggleAimTargeting(true);

        } else if (this._isCard) {
            this._$arrowBaseObject = this.$node.find('.avatar.my');

            this._$grabCard = this._$clickObject.clone();
            this._$grabCard.addClass('grab-card');

            this._needTarget = !this._isMinionNeedBattleCryTarget && this._$grabCard.hasClass('need-target');
            this._isCardPlayable = this._$grabCard.hasClass('available');

            this._$clickObject.hide();

            this._$grabCard.appendTo(this.$node);
        }

        this._updateDragItemPosition();
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

    _tryMakeAction(e) {
        if (this._needTarget || this._isMinion || this._isHeroSkill) {
            const $targetPurpose = $(e.target).closest('.purpose');

            if ($targetPurpose.length) {
                this._$targetPurpose = $targetPurpose;

                this._makeAction();
            }

        } else {
            this._makeAction();
        }
    }

    _makeAction() {
        var actionName;
        var actionData = {};

        if (this._isCard) {
            actionName = 'play-card';
            actionData.id = this._$clickObject.data('id');

            if (this._isMinionCard) {
                const $creatures = this.$node.find('.my .creature');

                if ($creatures.length) {
                    const $right = $creatures.filter('.shift-right:eq(0)');

                    if ($right.length) {
                        actionData.index = $right.index();
                    } else {
                        actionData.index = $creatures.length;
                    }
                }
            }
        } else if (this._isMinion || this._isHero) {
            actionName = 'hit';
            actionData.by = this._$clickObject.data('id');

        } else if (this._isHeroSkill) {
            actionName = 'use-hero-skill';
        }

        if (!this._isMinionCard) {
            if (this._isBattlecryPreview) {
                actionName = this._savedAction.actionName;
                actionData = this._savedAction.actionData;
            }

            actionData.targetSide = this._$targetPurpose.closest('.my,.op').hasClass('my') ? 'my' : 'op';
            actionData.target = this._$targetPurpose.data('id');
        }

        if (this._isMinionNeedBattleCryTarget) {
            this._savedAction = {
                actionName,
                actionData,
                _$clickObject: this._$clickObject
            };

            const $container = $('<DIV>');

            render($container, 'creature', {
                id: 'new',
                classes: 'battlecry-preview',
                minion: {},
                card: { pic: '147/808/410' }
            });

            const $creature = $container.children();

            if (actionData.index != null && actionData.index !== this._$minions.length) {
                $creature.insertBefore(this.$node.find('.my .creature').eq(actionData.index));
            } else {
                $creature.appendTo('.my.creatures');
            }

            this._release(true);

            this._onMouseDown({ currentTarget: $creature.get(0) });
            this._grabObject();

        } else {
            this._release();

            H.socket.send(actionName, actionData);
        }
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
            this._setArrowBase();

            const actionData = {};

            if (this._isCard) {
                actionData.cardId = this._$clickObject.data('id');

            } else if (this._isBattlecryPreview) {
                actionData.cardId = this._savedAction.actionData.id;

            } else if (this._isMinion || this._isHeroSkill || this._isHero) {
                actionData.creatureId = this._$clickObject.data('id');
            }

            H.socket.send('get-targets', actionData);

        } else {
            this._$arrow.removeClass('with-crosshair');
        }
    }

    _toggleCardActivation(enable) {
        if (this._isCard) {

            this._$grabCard.toggleClass('blue-glow', enable);

            if (enable) {
                if (this._isMinionCard) {
                    if (!this._minionsPositions) {
                        this._$minions = this.$node.find('.my .creature');
                        this._minionsPositions = this._$minions.map((i, node) => {
                            const $minion = $(node);

                            return $minion.offset().left + $minion.outerWidth() / 2;
                        });
                    }
                }
            } else {
                if (this._isMinionCard && this._$minions) {
                    this._$minions.removeClass('shift-left shift-right');

                    this._$minions = null;
                    this._minionsPositions = null;
                }
            }
        }
    }

    _shiftMinions() {
        const x = this._mouse.x;

        this._$minions.each((i, node) => {
            const $minion = $(node);

            const minionX = this._minionsPositions[i];

            $minion
                .toggleClass('shift-right', x <= minionX)
                .toggleClass('shift-left', x > minionX);
        });
    }

    _setArrowBase() {
        const pos = this._$arrowBaseObject.offset();

        this._arrowBasePosition = {
            x: pos.left + this._$arrowBaseObject.outerWidth() / 2,
            y: pos.top + this._$arrowBaseObject.outerHeight() / 2
        };

        if (this._isHeroSkill) {
            this._arrowBasePosition.x += 5;
            this._arrowBasePosition.y += 10;
        }

        this._$arrow.css({
            bottom: 720 - this._arrowBasePosition.y,
            left: this._arrowBasePosition.x
        });
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
        this._clearPurposes();

        const targetsDetails = data.targets;

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

    _clearPurposes() {
        this.$node.find('.purpose').removeClass('purpose');
    }

    _toggleCrosshair(enable) {
        this._$arrow.toggleClass('with-crosshair', enable);
    }

};
