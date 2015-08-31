
var socket = null;

new Screen({
    gClass: 'b',
    name: 'battle',
    draw: function() {
        render($app, 'battle');

        var dragging = false;
        var $dragCard;

        const $cardPreview = $('<DIV>')
            .addClass('card-preview')
            .append($('<IMG>'))
            .appendTo('.hand.my')
            .hide();

        $app
            .on('click', '.hand.my .card.available', e => {
                if (hbe.battleData.my.active) {
                    const $card = $(e.currentTarget);

                    $('.selected').removeClass('selected');
                    $card.addClass('selected');

                    send('get-targets', {
                        'card-id': $card.data('id')
                    });
                }
            })
            .on('click', '.creatures.op .creature.purpose', e => {

                if (hbe.battleData.my.active) {
                    const $myCreature = $('.creatures.my .creature.selected');

                    if ($myCreature.length) {
                        const $enemyCreature = $(e.currentTarget);

                        send('hit', {
                            my: $myCreature.data('id'),
                            op: $enemyCreature.data('id')
                        });
                    }

                }
            })
            .on('click', '.end-turn', () => {
                if (hbe.battleData.my.active) {
                    send('end-turn');
                }
            })
            .on('click', '.creatures.my .creature', e => {
                if (hbe.battleData.my.active) {
                    var $creature = $(e.currentTarget);

                    $('.selected').removeClass('selected');
                    $creature.addClass('selected');

                    send('get-targets', {
                        'creature-id': $creature.data('id')
                    });
                }
            })
            .on('click', '.avatar.op', () => {
                if (hbe.battleData.my.active) {

                    const $myCreature = $('.creatures.my .creature.selected');

                    if ($myCreature.length) {
                        send('hit', {
                            my: $myCreature.data('id'),
                            op: 'hero'
                        });
                    }
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
            .on('mousedown', '.card-wrap', e => {
                if (!hbe.battleData.my.active) {
                    return;
                }

                const $card = $(e.currentTarget);

                if (!$card.hasClass('available')) {
                    return;
                }

                dragging = true;

                $('.battle').addClass('dragging');

                $dragCard = $card.clone();

                $dragCard.data('linked-card', $card[0]);

                $dragCard.addClass('card-drag');

                $dragCard.appendTo('.battle');

                $card.hide();
            })
            .on('mousemove', e => {
                 if ($dragCard) {
                     $dragCard.css({
                         top: e.pageY - 70,
                         left: e.pageX - 50
                     });
                 }
            })
            .on('mouseup', e => {
                if ($dragCard) {

                    console.log(e);

                    if ($(e.target).closest('.battleground').length) {
                        send('play-card', {
                            id: $dragCard.data('id')
                        });

                    } else {
                        $($dragCard.data('linked-card')).show();
                    }

                    dragging = false;
                    $dragCard.remove();
                    $dragCard = null;

                    $('.battle').removeClass('dragging');
                }
            })
            .on('click', '.card-repick', e => {
                $(e.currentTarget).toggleClass('replace');
            })
            .on('click', '.repick-layer .confirm', () => {
                const replaceIds = $('.card-repick.replace').map((i, el) => $(el).data('id')).get();

                send('replace-cards', replaceIds);
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

function updateInGameData() {

    $('.repick-layer').remove();

    clearPurposes();

    const game = hbe.battleData;

    $('.battle').toggleClass('active', game.my.active);

    $('.name.op').text(game.op.name);
    $('.name.my').text(game.my.name);

    if (!game.my.active) {
        $('.selected').removeClass('selected');
    }

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

}

function clearPurposes() {
    $('.avatar .creature')
        .removeClass('purpose');
}

function updateInGameTargets(data) {
    const targets = data.targets;

    clearPurposes();

    if (targets !== 'not-need') {

        if (targets.my) {

            if (targets.my.hero) {
                $('.avatar.my').addClass('purpose')
            }

            if (targets.my.minions) {
                targets.my.minions.forEach(minionId => {
                    $('.creatures.my .creature[data-id="' + minionId + '"]').addClass('purpose');
                });
            }
        }

        if (targets.op) {

            if (targets.op.hero) {
                $('.avatar.op').addClass('purpose')
            }

            if (targets.op.minions) {
                targets.op.minions.forEach(minionId => {
                    $('.creatures.op .creature[data-id="' + minionId + '"]').addClass('purpose');
                });
            }
        }
    }
}

function drawCardsForPick(deckCards) {
    const $cards = $('.repick-layer .cards');

    deckCards.forEach(deckCard => {
        const $card = $('<div>').addClass('card-repick').data('id', deckCard.id);
        $card.append($('<img>').attr('src', 'http://media-hearth.cursecdn.com/avatars/'+deckCard.card.pic+'.png'));

        $cards.append($card);
    });
}
