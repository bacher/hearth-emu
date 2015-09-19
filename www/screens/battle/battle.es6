var socket = null;

H.Screens['battle'] = class BattleScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'b',
            name: 'battle',
            hash: 'battle'
        });

        this._prevActiveStatus = false;
    }

    _render() {
        render(this.$node, 'battle');

        this.$node.addClass('normal');

        this._playCard = new H.PlayCard(this);
        this._hand = new H.Hand(this);
    }

    _bindEventListeners() {
        H.socket.on('game-data', this._onGameData.bind(this));
        H.socket.on('cards-for-repick', this._onCardsForPick.bind(this));
        H.socket.on('select-card', this._onCardSelection.bind(this));
        H.socket.on('defeat', this._onDefeat.bind(this));
        H.socket.on('win', this._onWin.bind(this));
        H.socket.on('burn-card', this._onBurnCard.bind(this));
        H.socket.on('fatigue', this._onFatigue.bind(this));

        this._playCard.bindEventListeners();

        this.$node
            .on('click', '.end-turn', () => {
                if (this.battleData.my.active) {
                    H.socket.send('end-turn');
                }
            })
            .on('click', '.card-select-wrapper', this._onCardSelect.bind(this));
    }

    _show() {
        this.$node.show();

        this.showWelcomeScreen();
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

    _onBurnCard(data) {
        this._hand.burnCard(data);
    }

    _onFatigue(data) {
        this._hand.fatigue(data);
    }

    updateInGameData() {

        this.$node.find('.shadow').remove();

        this.clearPurposes();

        const game = this.battleData;

        this.$node.find('.battle')
            .toggleClass('active', game.my.active)
            .toggleClass('wait', !game.my.active);

        this.$node.find('.creatures').empty();

        this.$node.find('.avatar.my').toggleClass('available', game.my.active && game.my.hero.attack > 0 && !game.my.hero.flags['tired']);

        this.$node.find('.hero-skill.my')
            .toggleClass('available', game.my.hero.canUseSkill)
            .toggleClass('off', game.my.hero.skillUsed)
            .toggleClass('need-target', game.my.hero.isHeroSkillTargeting);

        this.$node.find('.hero-skill.op')
            .toggleClass('used', game.op.hero.skillUsed);

        ['my', 'op'].forEach(side => {
            const player = game[side];
            const hero = player.hero;

            const $creatures = this.$node.find('.creatures.' + side);

            player.creatures.forEach(minion => {
                var $container = $('<div>');

                var classes = '';
                for (var prop in minion.flags) {
                    classes += ' ';
                    classes += prop;
                }

                render($container, 'creature', { minion, classes });

                const $minion = $container.children();

                if (game.my.active) {
                    if (side === 'my' && !minion.flags['tired'] && minion.attack > 0) {
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

            const cardsLeft = player.deck.count;
            var deckClass;

            if (cardsLeft === 0) {
                deckClass = 'hole';
            } else if (cardsLeft === 1) {
                deckClass = 's1';
            } else if (cardsLeft < 7) {
                deckClass = 's2'
            } else if (cardsLeft < 14) {
                deckClass = 's3';
            } else if (cardsLeft < 20) {
                deckClass = 's4';
            } else {
                deckClass = 's5'
            }

            this.$node.find('.deck.' + side).removeClass('s1 s2 s3 s4 s5').addClass(deckClass);
            this.$node.find('.deck-helper.' + side + ' .value').text(cardsLeft);

            render(this.$node.find('.traps.' + side), 'traps', {
                traps: player.traps
            });

            this._hand.onGameData(game);
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
        this.$node.find('.avatar, .creature').removeClass('purpose');
    }

    setBattleData(data) {
        this.welcomeScreen.setBattleData(data);

        this._myClass = data.my.clas;

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

    _showYourTurnSplash() {
        const $yourTurn = this.$node.find('.your-turn').show();

        $yourTurn.on('animationend', () => {
            $yourTurn.hide();
        });
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

    _onDefeat() {
        this._onBattleEnd(false);
    }

    _onWin() {
        this._onBattleEnd(true);
    }

    _onBattleEnd(isWin) {
        setTimeout(() => {
            const boomSide = isWin ? 'op' : 'my';

            this.$node.find('.hero.' + boomSide).hide();
            this.$node.find('.boom.' + boomSide).show();

            setTimeout(() => {
                const className = H.CLASSES_L[this._myClass];
                this._battleEndOverlay = H.app.activateOverlay('battle-end', {
                    win: isWin,
                    className
                });
            }, 2500);
        }, 500);
    }

    onBattleEndSplashClose() {
        this._battleEndOverlay.hideThenDestroy();

        H.app.activateScreen('start-game-menu');
    }
};
