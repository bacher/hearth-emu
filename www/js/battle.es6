
var socket = null;

new H.Screen({
    gClass: 'b',
    name: 'battle',
    hash: 'battle',
    draw: function() {
        render($app, 'battle');

        var dragging = false;
        var aimTargeting = false;
        var heroTargeting = false;
        var $dragCard;
        var $aimingMinion = null;

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

                const targetType = $card.data('target');

                dragging = true;

                if (targetType === 'not-need') {
                    $('.battle').addClass('dragging');

                    $dragCard = $card.clone();

                    $dragCard.data('linked-card', $card[0]);

                    $dragCard.addClass('card-drag');

                    $dragCard.appendTo('.battle');

                } else {
                    send('get-targets', {
                        cardId: $card.data('id')
                    });

                    $('.hero.my .avatar').addClass('casting');

                    aimTargeting = true;
                    heroTargeting = true;

                    $dragAim.css({
                        bottom: 170,
                        left: 618
                    });

                    $dragAim.data('linked-card', $card[0]);

                    $dragAim.show();
                }

                $card.hide();

            })
            .on('mousedown', '.creature.available', e => {
                if (!H.battleData.my.active) { return; }

                $aimingMinion = $(e.currentTarget);

                dragging = true;

                send('get-targets', {
                    creatureId: $aimingMinion.data('id')
                });

                aimTargeting = true;
                heroTargeting = false;

                const minionPosition = $aimingMinion.offset();

                $dragAim.css({
                    bottom: 720 - (minionPosition.top + $aimingMinion.height() / 2),
                    left: minionPosition.left + $aimingMinion.width() / 2 - 24
                });

                $dragAim.data('linked-card', $aimingMinion[0]);

                $dragAim.show();

                $aimingMinion.addClass('aiming');

            })
            .on('mousemove', e => {

                if (dragging) {

                    if (aimTargeting) {

                        var sourcePos;

                        if (heroTargeting) {
                            sourcePos = {
                                x: 643,
                                y: 548
                            };
                        } else {
                            const minionPosition = $aimingMinion.offset();
                            sourcePos = {
                                x: minionPosition.left + $aimingMinion.width() / 2,
                                y: minionPosition.top + $aimingMinion.height() / 2
                            };
                        }


                        const dX = sourcePos.x - e.pageX;
                        const dY = sourcePos.y - e.pageY;
                        const distance = Math.sqrt(dX * dX + dY * dY);

                        let angle = Math.atan(dX / dY);

                        if (dY < 0) {
                            angle = angle + Math.PI;
                        }

                        $dragAim
                            .height(distance - 60)
                            .css('transform', 'rotate(' + -angle + 'rad)');

                    } else {
                        $dragCard.css({
                            top: e.pageY - 70,
                            left: e.pageX - 50
                        });
                    }
                }
            })
            .on('mouseup', e => {
                if (dragging) {

                    const $target = $(e.target);

                    if (aimTargeting) {
                        const $purpose = $target.closest('.purpose');
                        const purposeId = $purpose.hasClass('creature') ? $purpose.data('id') : 'hero';

                        if ($purpose.length) {
                            const $myCard = $($dragAim.data('linked-card'));

                            if (heroTargeting) {
                                send('play-card', {
                                    id: $myCard.data('id'),
                                    targetSide: 'op', //FIXME
                                    target: purposeId
                                });
                            } else {
                                send('hit', {
                                    by: $myCard.data('id'),
                                    targetSide: 'op',
                                    target: purposeId
                                });
                            }

                        } else {
                            const $source = $($dragAim.data('linked-card'));
                            if (heroTargeting) {
                                $source.show();
                            } else {
                                $source.removeClass('aiming');
                            }
                        }

                        $('.hero.my .avatar').removeClass('casting');
                        $dragAim.hide();

                        heroTargeting = false;
                        aimTargeting = false;

                    } else {
                        if ($target.closest('.battleground').length) {
                            send('play-card', {
                                id: $dragCard.data('id')
                            });

                        } else {
                            $($dragCard.data('linked-card')).show();
                        }

                        $dragCard.remove();
                        $dragCard = null;
                    }

                    dragging = false;

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

    game.my.hand.forEach((card, i) => {
        var $container = $('<div>');
        render($container, 'card', card);

        const $cardWrapper = $container.children();

        $cardWrapper.addClass('c' + (i + 1));

        if (game.my.active) {
            if (card.base.cost <= game.my.hero.mana) {
                $cardWrapper.addClass('available');
            }
        }

        $hand.append($cardWrapper);
    });


    $('.hero-skill.my')
        .toggleClass('available', game.my.active && game.my.hero.canUseSkill)
        .toggleClass('used', game.my.hero.skillUsed);

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

    $hand.add($handOp)
        .removeClass('hand1 hand2 hand3 hand4 hand5 hand6 hand7 hand8 hand9 hand10');

    $hand.addClass('hand' + game.my.hand.length);
    $handOp.addClass('hand' + game.op.hand.length);

    ['my', 'op'].forEach(side => {
        const player = game[side];
        const hero = player.hero;

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
                pic: minion.card.pic
            });

            const $minion = $container.children();
            if (side === 'my' && !minion.flags['sleep'] && !minion.flags['tired'] && minion.attack > 0) {
                $minion.addClass('available');
            }
            $creatures.append($minion);
        });

        $('.avatar.' + side + ' .health .value').text(hero.hp);

        $('.stats.' + side + ' .mana .active').text(hero.mana);
        $('.stats.' + side + ' .mana .all').text(hero.crystals);

        $('.deck-helper.' + side + ' .value').text(player.deck.count);
    });

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
