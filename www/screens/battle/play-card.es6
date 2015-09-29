
H.KEYS = {
    escape: 27
};


H.PlayCard = class PlayCard {
    constructor(battle) {
        this.battle = battle;

        this.$node = battle.$node;

        this._$clickObject = null;
        this._$grabCard = null;
        this._$arrow = this.$node.find('.targeting-arrow');

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
            this._initGrab({
                $on: $(e.currentTarget)
            });
        }
    }

    _initGrab(params = {}) {
        this._$clickObject = params.$on || this.$node.find('.avatar.my');

        this.$node
            .on('mousemove', this._onMouseMove)
            .on('mouseup', this._onMouseUp);

        $(document).on('keydown', this._onKeyDown);
        $(document).on('contextmenu', this._onContextMenu);
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

        if (this._isBattlecryPreview || this._isChooseAction || this._isChooseDialogCanceled) {
            if (!success) {
                this._savedAction.$clickObject.show();
                this._savedAction.$tmpObject.remove();
            }

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

        if (this._isCard) {
            this._$grabCard.remove();
            this._$grabCard = null;
        }

        this._isCard = false;
        this._isMinionCard = false;
        this._isMinionNeedBattleCryTarget = false;
        this._isChooseAction = false;
        this._choosenCardAction = false;
        this._isChooseDialogCanceled = false;
    }

    _grabObject() {
        this._targeting = true;

        this._isCard = this._$clickObject.hasClass('card-wrap');
        if (this._isCard) {
            this._isChooseAction = this._$clickObject.hasClass('choose-action');
        }

        this._isMinionCard = this._isCard && this._$clickObject.hasClass('minion');
        this._isMinionNeedBattleCryTarget = this._isMinionCard && this._$clickObject.hasClass('need-battlecry-target');

        this._isMinion = this._$clickObject.hasClass('creature');
        this._isBattlecryPreview = this._isMinion && this._$clickObject.hasClass('battlecry-preview');

        this._isHeroSkill = this._$clickObject.hasClass('hero-skill');
        if (!this._choosenCardAction) {
            this._isHero = this._$clickObject.hasClass('avatar');
        }

        if (this._isMinion || this._isHeroSkill || this._isHero || this._choosenCardAction) {
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

            H.rotateByVector(this._$arrow, dX, dY);

            this._$arrow.height(distance)

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
        if (this._needTarget || this._isMinion || this._isHero || this._isHeroSkill || this._choosenCardAction) {
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

        if (this._isCard || this._choosenCardAction) {
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

        if (this._$targetPurpose) {
            if (this._isBattlecryPreview || this._choosenCardAction) {
                actionName = this._savedAction.actionName;
                actionData = this._savedAction.actionData;
            }

            var destination;

            if (this._choosenCardAction) {
                destination = actionData.choosenCard;
            } else {
                destination = actionData;
            }

            destination.targetId = this._$targetPurpose.data('id');
        }

        if (this._isMinionNeedBattleCryTarget || this._isChooseAction) {
            this._savedAction = {
                actionName,
                actionData,
                $clickObject: this._$clickObject
            };

            if (this._isMinionNeedBattleCryTarget || this._isMinionCard) {
                const $creature = render(null, 'creature', {
                    id: 'new',
                    classes: 'battlecry-preview',
                    minion: { pic: '147/808/410' }
                });

                if (actionData.index != null && actionData.index !== this._$minions.length) {
                    $creature.insertBefore(this.$node.find('.my .creature').eq(actionData.index));
                } else {
                    $creature.appendTo('.my.creatures');
                }

                this._savedAction.$tmpObject = $creature;

                const minionNeedBattleCry = this._isMinionNeedBattleCryTarget;

                this._release(true);

                if (minionNeedBattleCry) {
                    this._initGrab({ $on: $creature });
                    this._grabObject();

                } else {
                    const cardHandId = this._savedAction.$clickObject.data('id');
                    const cardInfo = _.find(this.battle.battleData.my.hand, { id: cardHandId });

                    H.app.activateOverlay('choose-card', {
                        cards: cardInfo.additionActions,
                        onSelect: index => {
                            const selectedCard = cardInfo.additionActions[index];

                            actionData.choosenCard = {
                                id: selectedCard.id
                            };

                            if (selectedCard.isNeedTarget) {
                                this._choosenCardAction = true;
                                this._initGrab();
                                this._grabObject();

                            } else {
                                this._postAction('play-card', actionData);
                            }
                        },
                        onCancel: () => {
                            this._isChooseDialogCanceled = true;
                            this._release();
                        }
                    });
                }
            }

        } else {
            this._release();

            this._postAction(actionName, actionData);
        }
    }

    _postAction(actionName, actionData) {
        this.$node.find('.available').removeClass('available');

        H.socket.send(actionName, actionData);
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
        if (enable) {
            H.disableMenu = true;
        } else {
            setTimeout(() => {
                H.disableMenu = false;
            }, 500);
        }

        this.$node.toggleClass('arrow-mode', enable);
        this.$node.toggleClass('normal-mode', !enable);

        this._$arrow.toggle(enable);

        this._arrowMode = enable;

        if (enable) {
            this._setArrowBase();

            const actionData = {};

            if (this._choosenCardAction) {
                actionData.realCardId = this._savedAction.actionData.choosenCard.id;

            } else if (this._isCard) {
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
        const $cloud = render(null, 'notice-cloud', { text: 'Not enough Mana' });

        $cloud.on('animation-end', () => {
            $cloud.remove();
        });

        this.$node.append($cloud);
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
