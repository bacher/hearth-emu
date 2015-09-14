
var socket = null;

H.Screens['battle'] = class BattleScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'b',
            name: 'battle',
            hash: 'battle'
        });

        this.dragging = false;
        this.aimTargeting = false;
        this.spellTargeting = false;
        this.battlecryTargeting = false;
        this.$dragCard = null;
        this.$aimingObject = null;

        this._prevActiveStatus = false;
    }

    _render() {
        render(this.$node, 'battle');

        this.$node.addClass('normal');

        this.$cardPreview = this.$node.find('.card-preview');

        this.$dragAim = $('<div>').addClass('targeting').appendTo(this.$node);

        this._playCard = new H.PlayCard(this);
    }

    _bindEventListeners() {
        H.socket.on('game-data', this._onGameData.bind(this));
        H.socket.on('cards-for-repick', this._onCardsForPick.bind(this));
        H.socket.on('select-card', this._onCardSelection.bind(this));

        this._playCard.bindEventListeners();

        this.$node
            .on('click', '.end-turn', () => {
                if (this.battleData.my.active) {
                    H.socket.send('end-turn');
                }
            })
            .on('mouseenter', '.hand.my .card-wrap', e => {
                if (!this.dragging) {
                    const $cardWrap = $(e.currentTarget);
                    const $img = $cardWrap.find('IMG');
                    const picUrl = $img.attr('src');

                    this.$cardPreview.find('IMG').attr('src', picUrl);
                    this.$cardPreview
                        .toggleClass('available', $cardWrap.hasClass('available'))
                        .show();
                }
            })
            .on('mouseleave', '.card-wrap', () => {
                this.$cardPreview.hide();
            })
            //.on('mousedown', '.card-wrap.available', e => {
            //    if (!this.battleData.my.active) {
            //        return;
            //    }
            //
            //    const $card = $(e.currentTarget);
            //
            //    this.startCardDrag($card);
            //
            //})
            //.on('mousedown', '.avatar.my.available, .creatures.my .creature.available, .hero-skill.my.available.need-target', this._onMouseDown1.bind(this))
            //.on('mousemove', this._onMouseMove.bind(this))
            //.on('mouseup', console.log.bind(console, 'MOUSEUP'))//this._onMouseUp.bind(this))
            .on('click', '.card-select-wrapper', this._onCardSelect.bind(this));
    }

    _show() {
        this.$node.show();

        this.showWelcomeScreen();
    }

    _onMouseDown1(e) {
        if (!this.battleData.my.active || this.dragging) {
            return;
        }

        this.$node.addClass('targeting');
        this.$node.removeClass('normal');

        this.$aimingObject = $(e.currentTarget);

        this.dragging = true;

        H.socket.send('get-targets', {
            creatureId: this.$aimingObject.data('id')
        });

        this.aimTargeting = true;
        this.spellTargeting = false;

        const minionPosition = this.$aimingObject.offset();

        this.$dragAim.css({
            bottom: 720 - (minionPosition.top + this.$aimingObject.outerHeight() / 2),
            left: minionPosition.left + this.$aimingObject.outerWidth() / 2
        });

        this.$dragAim.data('linked-card', this.$aimingObject[0]);

        this.$dragAim.show();

        this.$aimingObject.addClass('aiming');
    }

    _onMouseMove(e) {
        if (this.dragging) {

            if (this.aimTargeting) {

                var sourcePos;

                if (this.spellTargeting) {
                    sourcePos = {
                        x: 643,
                        y: 548
                    };
                } else {
                    const minionPosition = this.$aimingObject.offset();
                    sourcePos = {
                        // TODO: Why +4/+20 ?
                        x: minionPosition.left + this.$aimingObject.outerWidth() / 2 + 4,
                        y: minionPosition.top + this.$aimingObject.outerWidth() / 2 + 20
                    };
                }

                const dX = sourcePos.x - e.pageX;
                const dY = sourcePos.y - e.pageY;
                const distance = Math.sqrt(dX * dX + dY * dY);

                var angle = Math.atan(dX / dY);

                if (dY < 0) {
                    angle = angle + Math.PI;
                }

                this.$dragAim
                    .height(distance - 60)
                    .css('transform', 'rotate(' + -angle + 'rad)');


                const $purpose = $(e.target).closest('.purpose');
                this.$node.find('.targeting').toggleClass('aim', $purpose.length > 0);

            } else {
                this.$dragCard.css({
                    top: e.pageY,
                    left: e.pageX
                });
            }
        }
    }

    _onMouseUp(e) {
        if (this.dragging) {
            this.dragging = false;

            this.$node.removeClass('hide-cursor');

            this.$node.addClass('normal');
            this.$node.removeClass('targeting');

            const $target = $(e.target);

            if (this.aimTargeting) {
                const $purpose = $target.closest('.purpose');
                var purposeId;

                purposeId = $purpose.data('id');

                const $collection = $purpose.closest('.my, .op');
                const targetSide = $collection.hasClass('my') ? 'my' : 'op';

                if ($purpose.length) {
                    const $myCard = $(this.$dragAim.data('linked-card'));
                    const id = $myCard.data('id');

                    if (this.spellTargeting || this.battlecryTargeting) {
                        H.socket.send('play-card', {
                            id: id,
                            targetSide: targetSide,
                            target: purposeId
                        });
                    } else if (id === 'hero-skill') {
                        H.socket.send('use-hero-skill', {
                            targetSide: targetSide,
                            target: purposeId
                        });
                    } else {
                        H.socket.send('hit', {
                            by: id,
                            targetSide: targetSide,
                            target: purposeId
                        });
                    }

                } else {
                    const $source = $(this.$dragAim.data('linked-card'));
                    if (this.spellTargeting) {
                        $source.show();
                    } else {
                        $source.removeClass('aiming');
                    }
                }

                this.$node.find('.hero.my .avatar').removeClass('casting');
                this.$dragAim.hide();

                this.battlecryTargeting = false;
                this.spellTargeting = false;
                this.aimTargeting = false;

            } else {
                const $linkedCard = $(this.$dragCard.data('linked-card'));

                if ($target.closest('.battleground').length) {
                    if ($linkedCard.hasClass('need-battlecry-target')) {
                        this.battlecryTargeting = true;

                        this.startCardDrag($linkedCard);
                    } else {
                        H.socket.send('play-card', {
                            id: this.$dragCard.data('id')
                        });
                    }

                } else {
                    $linkedCard.show();
                }

                this.$dragCard.remove();
                this.$dragCard = null;
            }

            this.$node.find('.purpose').removeClass('purpose');

            this.$node.find('.battle').removeClass('dragging');
        }
    }

    _onGameData(data) {
        if (this.welcomeScreen) {
            this.welcomeScreen.hideThenDestroy();
            this.welcomeScreen = null;

            if (H.checkParam('endturn')) {
                // FIXME
                setInterval(() => {
                    if (this.battleData && this.battleData.my.active) {
                        H.socket.send('end-turn');
                    }
                }, 200);
            }
        }

        this.battleData = data;
        this.updateInGameData();
    }

    _onCardsForPick(data) {
        this.welcomeScreen.setPickCardsData(data);
    }

    _onCardSelection(data) {
        const $cardSelection = this.$node.find('.card-selection');
        const $container = $cardSelection.find('.cards-container').empty();
        data.cards.forEach((card, i) => {
            const $wrapper = $('<div>')
                .addClass('card-select-wrapper')
                .data('index', i);

            $('<img>')
                .addClass('card-select-preview')
                .attr('src', H.makeCardUrl(card.pic))
                .appendTo($wrapper);

            $container.append($wrapper);
        });

        $cardSelection.show();
    }

    _onCardSelect(e) {
        const $preview = $(e.currentTarget);

        H.socket.send('card-selection', { index: $preview.data('index') });

        this.$node.find('.card-selection').hide();
    }

    updateInGameData() {

        this.$node.find('.shadow').remove();

        this.clearPurposes();

        const game = this.battleData;

        this.$node.find('.battle')
            .toggleClass('active', game.my.active)
            .toggleClass('wait', !game.my.active);

        const $hand = this.$node.find('.hand.my .cards').empty();
        const $handOp = this.$node.find('.hand.op .cards').empty();

        this.$node.find('.creatures').empty();

        game.my.hand.forEach((handCard, i) => {
            const base = handCard.base;
            var $container = $('<div>');

            render($container, 'card', handCard);

            const $cardWrapper = $container.children();

            if (base.targetsType) {
                $cardWrapper.addClass('need-target');
            }

            $cardWrapper.addClass('c' + (i + 1));

            $hand.append($cardWrapper);
        });


        this.$node.find('.avatar.my').toggleClass('available', game.my.active && game.my.hero.attack > 0 && !game.my.hero.flags['tired']);

        this.$node.find('.hero-skill.my')
            .toggleClass('available', game.my.hero.canUseSkill)
            .toggleClass('off', game.my.hero.skillUsed)
            .toggleClass('need-target', game.my.hero.isHeroSkillTargeting);

        this.$node.find('.hero-skill.op')
            .toggleClass('used', game.op.hero.skillUsed);

        var $container = $('<div>');
        render($container, 'card');

        const $cardPattern = $container.children();

        for (var i = game.op.hand.length - 1; i >= 0; --i) {
            const $card = $cardPattern.clone();

            $card.addClass('c' + (i + 1));

            $handOp.append($card);
        }

        ['my', 'op'].forEach(side => {
            const player = game[side];
            const hero = player.hero;

            this.$node.find('.hand.' + side).removeClass().addClass('hand ' + side).addClass('hand' + player.hand.length);

            const $creatures = this.$node.find('.creatures.' + side);

            player.creatures.forEach(minion => {
                var $container = $('<div>');

                var classes = '';
                for (var prop in minion.flags) {
                    classes += ' ';
                    classes += prop;
                }

                render($container, 'creature', {
                    id: minion.id,
                    classes: classes,
                    minion: minion,
                    card: minion.card
                });

                const $minion = $container.children();

                if (game.my.active) {
                    if (side === 'my' && !minion.flags['sleep'] && !minion.flags['tired'] && minion.attack > 0) {
                        $minion.addClass('available');
                    }
                }
                $creatures.append($minion);
            });

            const $avatar = this.$node.find('.avatar.' + side);

            $avatar.find('.health').show();
            $avatar.find('.health .value').text(hero.hp);

            $avatar.find('.armor').toggle(hero.armor > 0)
                .find('.value').text(hero.armor);

            $avatar.find('.attack').toggle(hero.attack > 0)
                .find('.value').text(hero.attack);


            const $weapon = this.$node.find('.weapon.' + side);
            if (player.hero.weapon) {
                $weapon.show();
                $weapon.toggleClass('off', !player.active);
                $weapon.find('.attack').text(player.hero.weapon.attack);
                $weapon.find('.durability').text(player.hero.weapon.durability);
            } else {
                $weapon.hide();
            }

            this.$node.find('.stats.' + side + ' .mana .active').text(hero.mana);
            this.$node.find('.stats.' + side + ' .mana .all').text(hero.crystals);

            this.$node.find('.deck-helper.' + side + ' .value').text(player.deck.count);

            render(this.$node.find('.traps.' + side), 'traps', {
                traps: player.traps
            });
        });

        const hero = game.my.hero;

        this.$node.find('.stats .crystals')
            .removeClass()
            .addClass('crystals')
            .addClass('cn' + hero.mana)
            .addClass('co' + (hero.crystals - hero.mana - hero.overload))
            .addClass('cl' + hero.overload)
            .addClass('no' + hero.nextOverload);

        this.$node.find('.hand-helper.op .value').text(game.op.hand.length);

        this.$node.find('.end-turn').toggleClass('active', game.my.active);

        if (this._prevActiveStatus !== game.my.active) {
            if (game.my.active) {
                this._showYourTurnSplash();
            }

            this._prevActiveStatus = game.my.active;
        }
    }

    clearPurposes() {
        this.$node.find('.avatar .creature').removeClass('purpose');
    }

    setBattleData(data) {
        this.welcomeScreen.setBattleData(data);

        const myClass = H.CLASSES_L[data.my.clas];
        const opClass = H.CLASSES_L[data.op.clas];

        this.$node.find('.avatar.my').addClass(myClass);
        this.$node.find('.avatar.op').addClass(opClass);

        this.$node.find('.hero-skill.my').addClass(myClass);
        this.$node.find('.hero-skill.op').addClass(opClass);

        this.$node.find('.name.my').text(data.my.name);
        this.$node.find('.name.op').text(data.op.name);
    }

    showWelcomeScreen() {
        this.welcomeScreen = H.app.activateOverlay('battle-welcome');
    }

    startCardDrag($card) {
        const isNeedTarget = $card.hasClass('need-target');
        const isNeedBattlecryTarget = $card.hasClass('need-battlecry-target');

        this.dragging = true;

        if (isNeedTarget && (!isNeedBattlecryTarget || this.battlecryTargeting)) {
            H.socket.send('get-targets', {
                cardId: $card.data('id')
            });

            this.$node.addClass('targeting');
            this.$node.removeClass('normal');

            this.$node.find('.hero.my .avatar').addClass('casting');

            this.aimTargeting = true;
            this.spellTargeting = true;

            const $dragAim = this.$dragAim;

            $dragAim.css({
                bottom: 167,
                left: 643
            });

            $dragAim.data('linked-card', $card[0]);

            $dragAim.show();

            this.$node.addClass('hide-cursor');

        } else {
            this.$node.find('.battle').addClass('dragging');

            this.$dragCard = $card.clone();

            this.$dragCard.data('linked-card', $card[0]);

            this.$dragCard.addClass('card-drag');

            this.$dragCard.appendTo('.battle');
        }

        $card.hide();
    }

    _showYourTurnSplash() {
        const $yourTurn = this.$node.find('.your-turn').show();

        $yourTurn.on('animationend', () => {
            $yourTurn.hide();
        });
    }
};
