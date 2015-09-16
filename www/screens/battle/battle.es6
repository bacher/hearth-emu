
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

        this.$cardPreview = this.$node.find('.card-preview');

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
                const $cardWrap = $(e.currentTarget);
                const $img = $cardWrap.find('IMG');
                const picUrl = $img.attr('src');

                this.$cardPreview.find('IMG').attr('src', picUrl);
                this.$cardPreview
                    .toggleClass('available', $cardWrap.hasClass('available'))
                    .toggleClass('combo-mode', $cardWrap.hasClass('combo-mode'))
                    .show();
            })
            .on('mouseleave', '.card-wrap', () => {
                this.$cardPreview.hide();
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
            var $container = $('<div>');

            var classes = handCard.type === H.CARD_TYPES['minion'] ? 'minion' : '';

            for (var flag in handCard.flags) {
                if (flag === 'can-play') {
                    flag = 'available';
                }

                classes += ' ' + flag;
            }

            render($container, 'card', {
                classes,
                handCard
            });

            const $cardWrapper = $container.children();

            if (handCard.targetsType) {
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
};
