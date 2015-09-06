
var socket = null;

new H.Screen({
    gClass: 'b',
    name: 'battle',
    hash: 'battle',
    draw: function() {
        render($app, 'battle');

        $app.addClass('normal');

        var dragging = false;
        var aimTargeting = false;
        var spellTargeting = false;
        var battlecryTargeting = false;
        var $dragCard;
        var $aimingObject = null;

        const $cardPreview = $('<DIV>')
            .addClass('card-preview')
            .append($('<IMG>'))
            .appendTo('.hand.my')
            .hide();

        const $dragAim = $('<div>').addClass('targeting').appendTo($app);

        $app
            .on('click', '.end-turn', () => {
                if (H.battleData.my.active) {
                    send('end-turn');
                }
            })
            .on('click', '.hero-skill.my.available', () => {
                send('use-hero-skill', {});
            })
            .on('mouseenter', '.hand.my .card-wrap', e => {
                if (!dragging) {
                    const $cardWrap = $(e.currentTarget);
                    const $img = $cardWrap.find('IMG');
                    const picUrl = $img.attr('src');

                    $cardPreview.find('IMG').attr('src', picUrl);
                    $cardPreview
                        .toggleClass('available', $cardWrap.hasClass('available'))
                        .show();
                }
            })
            .on('mouseleave', '.card-wrap', () => {
                $cardPreview.hide();
            })
            .on('mousedown', '.card-wrap.available', e => {
                if (!H.battleData.my.active) { return; }

                const $card = $(e.currentTarget);

                startCardDrag($card);

            })
            .on('mousedown', '.avatar.my.available, .creatures.my .creature.available, .hero-skill.my.available.need-target', e => {
                if (!H.battleData.my.active) { return; }

                $app.addClass('targeting');
                $app.removeClass('normal');

                $aimingObject = $(e.currentTarget);

                dragging = true;

                send('get-targets', {
                    creatureId: $aimingObject.data('id')
                });

                aimTargeting = true;
                spellTargeting = false;

                const minionPosition = $aimingObject.offset();

                $dragAim.css({
                    bottom: 720 - (minionPosition.top + $aimingObject.outerHeight() / 2),
                    left: minionPosition.left + $aimingObject.outerWidth() / 2
                });

                $dragAim.data('linked-card', $aimingObject[0]);

                $dragAim.show();

                $aimingObject.addClass('aiming');

            })
            .on('mousemove', e => {

                if (dragging) {

                    if (aimTargeting) {

                        var sourcePos;

                        if (spellTargeting) {
                            sourcePos = {
                                x: 643,
                                y: 548
                            };
                        } else {
                            const minionPosition = $aimingObject.offset();
                            sourcePos = {
                                // TODO: Why +4/+20 ?
                                x: minionPosition.left + $aimingObject.outerWidth() / 2 + 4,
                                y: minionPosition.top + $aimingObject.outerWidth() / 2 + 20
                            };
                        }

                        const dX = sourcePos.x - e.pageX;
                        const dY = sourcePos.y - e.pageY;
                        const distance = Math.sqrt(dX * dX + dY * dY);

                        var angle = Math.atan(dX / dY);

                        if (dY < 0) {
                            angle = angle + Math.PI;
                        }

                        $dragAim
                            .height(distance - 60)
                            .css('transform', 'rotate(' + -angle + 'rad)');


                        const $purpose = $(e.target).closest('.purpose');
                        $('.targeting').toggleClass('aim', $purpose.length > 0);

                    } else {
                        $dragCard.css({
                            top: e.pageY,
                            left: e.pageX
                        });
                    }
                }
            })
            .on('mouseup', e => {
                if (dragging) {
                    dragging = false;

                    $app.removeClass('hide-cursor');

                    $app.addClass('normal');
                    $app.removeClass('targeting');

                    const $target = $(e.target);

                    if (aimTargeting) {
                        const $purpose = $target.closest('.purpose');
                        var purposeId;

                        purposeId = $purpose.data('id');

                        const $collection = $purpose.closest('.my, .op');
                        const targetSide = $collection.hasClass('my') ? 'my' : 'op';

                        if ($purpose.length) {
                            const $myCard = $($dragAim.data('linked-card'));
                            const id = $myCard.data('id');

                            if (spellTargeting || battlecryTargeting) {
                                send('play-card', {
                                    id: id,
                                    targetSide: targetSide,
                                    target: purposeId
                                });
                            } else if (id === 'hero-skill') {
                                send('use-hero-skill', {
                                    targetSide: targetSide,
                                    target: purposeId
                                });
                            } else {
                                send('hit', {
                                    by: id,
                                    targetSide: targetSide,
                                    target: purposeId
                                });
                            }

                        } else {
                            const $source = $($dragAim.data('linked-card'));
                            if (spellTargeting) {
                                $source.show();
                            } else {
                                $source.removeClass('aiming');
                            }
                        }

                        $('.hero.my .avatar').removeClass('casting');
                        $dragAim.hide();

                        battlecryTargeting = false;
                        spellTargeting = false;
                        aimTargeting = false;

                    } else {
                        const $linkedCard = $($dragCard.data('linked-card'));

                        if ($target.closest('.battleground').length) {
                            if ($linkedCard.hasClass('need-battlecry-target')) {
                                battlecryTargeting = true;

                                startCardDrag($linkedCard)
                            } else {
                                send('play-card', {
                                    id: $dragCard.data('id')
                                });
                            }

                        } else {
                            $linkedCard.show();
                        }

                        $dragCard.remove();
                        $dragCard = null;
                    }

                    $('.purpose').removeClass('purpose');

                    $('.battle').removeClass('dragging');
                }
            })
            .on('click', '.card-repick', e => {
                $(e.currentTarget).toggleClass('replace');
            })
            .on('click', '.repick-layer .confirm', e => {
                const replaceIds = $('.card-repick.replace').map((i, el) => $(el).data('id')).get();

                send('replace-cards', replaceIds);

                $(e.currentTarget).remove();
            });
            //.on('click', '.battleground', e => {
            //    const $blow = $('<div>');
            //
            //    $blow.addClass('cursor-blow');
            //    $blow.css({
            //        top: e.pageY,
            //        left: e.pageX
            //    });
            //
            //    $app.append($blow);
            //
            //    setTimeout(() => {
            //        $blow.addClass('step2');
            //    }, 100);
            //
            //    setTimeout(() => {
            //        $blow.remove();
            //    }, 200);
            //});


        function startCardDrag($card) {
            const isNeedTarget = $card.hasClass('need-target');
            const isNeedBattlecryTarget = $card.hasClass('need-battlecry-target');

            dragging = true;

            if (isNeedTarget && (!isNeedBattlecryTarget || battlecryTargeting)) {
                send('get-targets', {
                    cardId: $card.data('id')
                });

                $app.addClass('targeting');
                $app.removeClass('normal');

                $('.hero.my .avatar').addClass('casting');

                aimTargeting = true;
                spellTargeting = true;

                $dragAim.css({
                    bottom: 167,
                    left: 643
                });

                $dragAim.data('linked-card', $card[0]);

                $dragAim.show();

                $app.addClass('hide-cursor');
            } else {
                $('.battle').addClass('dragging');

                $dragCard = $card.clone();

                $dragCard.data('linked-card', $card[0]);

                $dragCard.addClass('card-drag');

                $dragCard.appendTo('.battle');
            }

            $card.hide();
        }
    }
});

H.updateInGameData = function() {

    $('.shadow').remove();

    clearPurposes();

    const game = H.battleData;

    $('.battle').toggleClass('active', game.my.active);

    const $hand = $('.hand.my .cards').empty();
    const $handOp = $('.hand.op .cards').empty();

    $('.creatures').empty();

    game.my.hand.forEach((handCard, i) => {
        const base = handCard.base;
        var $container = $('<div>');

        render($container, 'card', handCard);

        const $cardWrapper = $container.children();

        if (base.targetsType) {
            $cardWrapper.addClass('need-target');
        }

        $cardWrapper.addClass('c' + (i + 1));

        if (game.my.active) {
            if (base.cost <= game.my.hero.mana) {
                $cardWrapper.addClass('available');
            }
        }

        $hand.append($cardWrapper);
    });


    $('.avatar.my').toggleClass('available', game.my.active && game.my.hero.attack > 0 && !game.my.hero.flags['tired']);

    $('.hero-skill.my')
        .toggleClass('available', game.my.active && game.my.hero.canUseSkill)
        .toggleClass('off', game.my.hero.skillUsed)
        .toggleClass('need-target', game.my.hero.isHeroSkillTargeting);

    $('.hero-skill.op')
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

        $('.hand.' + side).removeClass().addClass('hand ' + side).addClass('hand' + player.hand.length);

        const $creatures = $('.creatures.' + side);

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

        const $avatar = $('.avatar.' + side);

        $avatar.find('.health').show();
        $avatar.find('.health .value').text(hero.hp);

        $avatar.find('.armor').toggle(hero.armor > 0)
            .find('.value').text(hero.armor);

        $avatar.find('.attack').toggle(hero.attack > 0)
            .find('.value').text(hero.attack);


        const $weapon = $('.weapon.' + side);
        if (player.hero.weapon) {
            $weapon.show();
            $weapon.toggleClass('off', !player.active);
            $weapon.find('.attack').text(player.hero.weapon.attack);
            $weapon.find('.durability').text(player.hero.weapon.durability);
        } else {
            $weapon.hide();
        }

        $('.stats.' + side + ' .mana .active').text(hero.mana);
        $('.stats.' + side + ' .mana .all').text(hero.crystals);

        $('.deck-helper.' + side + ' .value').text(player.deck.count);
    });

    const hero = game.my.hero;

    $('.stats .crystals')
        .removeClass()
        .addClass('crystals')
        .addClass('cn' + hero.mana)
        .addClass('co' + (hero.crystals - hero.mana - hero.overload))
        .addClass('cl' + hero.overload)
        .addClass('no' + hero.nextOverload);

    $('.hand-helper.op .value').text(game.op.hand.length);

    $('.end-turn').toggleClass('active', game.my.active);

};

function clearPurposes() {
    $('.avatar .creature')
        .removeClass('purpose');
}

H.updateInGameTargets = function(data) {
    const targets = data.targets;

    clearPurposes();

    if (targets !== 'not-need') {

        if (targets.my) {

            if (targets.my.hero) {
                $('.avatar.my').addClass('purpose');
            }

            if (targets.my.minions) {
                targets.my.minions.forEach(minionId => {
                    $('.creatures.my .creature[data-id="' + minionId + '"]').addClass('purpose');
                });
            }
        }

        if (targets.op) {

            if (targets.op.hero) {
                $('.avatar.op').addClass('purpose');
            }

            if (targets.op.minions) {
                targets.op.minions.forEach(minionId => {
                    $('.creatures.op .creature[data-id="' + minionId + '"]').addClass('purpose');
                });
            }
        }
    }
};

H.drawWelcome = function(data) {
    const $welcome = $('.welcome');

    const myClass = H.CLASSES_L[data.my.clas];
    const opClass = H.CLASSES_L[data.op.clas];

    $('.avatar.my').addClass(myClass);
    $('.avatar.op').addClass(opClass);

    $welcome.find('.hero.my').addClass(myClass);
    $welcome.find('.hero.op').addClass(opClass);

    $('.hero-skill.my').addClass(myClass);
    $('.hero-skill.op').addClass(opClass);

    $('.name.my').text(data.my.name);
    $('.name.op').text(data.op.name);
};

H.drawCardsForPick = function(deckCards) {
    $('.welcome').hide();
    $('.repick-layer').show();
    const $cards = $('.repick-layer .cards');

    deckCards.forEach(deckCard => {
        const $card = $('<div>').addClass('card-repick').data('id', deckCard.id);
        $card.append($('<img>').attr('src', 'http://media-hearth.cursecdn.com/avatars/'+deckCard.card.pic+'.png'));

        $cards.append($card);
    });
};
