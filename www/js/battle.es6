
var socket = null;

new Screen({
    gClass: 'b',
    name: 'battle',
    draw: function() {
        render($app, 'battle');

        $app
            .on('click', '.hand.my .card.available', e => {
                if (hbe.battleData.my.active) {
                    const $card = $(e.currentTarget);

                    $('.selected').removeClass('selected');
                    $card.addClass('selected');
                }
            })
            .on('click', '.creatures.op .creature', e => {

                if (hbe.battleData.my.active) {
                    const $myCreature = $('.creatures.my .creature.selected');

                    if ($myCreature.length) {
                        const $enemyCreature = $(e.currentTarget);

                        send('hit-creature', {
                            my: $myCreature.data('crid'),
                            op: $enemyCreature.data('crid')
                        });
                    }

                }
            })
            .on('click', '.battleground', e => {
                if (hbe.battleData.my.active) {
                    const $card = $('.card.selected');

                    if ($card.length) {
                        send('play-card', {
                            id: $card.data('id')
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
                }
            })
            .on('click', '.avatar.op', () => {
                if (hbe.battleData.my.active) {

                    const $myCreature = $('.creatures.my .creature.selected');

                    if ($myCreature.length) {
                        send('hit-hero', {
                            my: $myCreature.data('crid')
                        });
                    }
                }
            })
            .on('click', '.hero-skill.my.available', () => {
                send('use-hero-skill', {});
            });
    }
});

function updateInGameData() {
    const game = hbe.battleData;

    $('.name.op').text(game.op.name);
    $('.name.my').text(game.my.name);

    if (!game.my.active) {
        $('.selected').removeClass('selected');
    }

    const $hand = $('.hand.my').empty();
    const $handOp = $('.hand.op').empty();

    $('.creatures').empty();

    game.my.hand.forEach(card => {
        var $container = $('<div>');
        render($container, 'card', card);

        if (game.my.active) {
            if (card.base.cost <= game.my.hero.mana) {
                $container.children().addClass('available');
            }
        }

        $hand.append($container.children());
    });

    $('.hero-skill.my')
        .toggleClass('available', game.my.active && game.my.hero.canUseSkill)
        .toggleClass('used', game.my.hero.skillUsed);

    $('.hero-skill.op')
        .toggleClass('used', game.op.hero.skillUsed);

    var $container = $('<div>');
    render($container, 'card');

    for (var i = 0; i < game.op.hand.length; ++i) {
        $handOp.append($container.children().clone());
    }

    ['my', 'op'].forEach(side => {
        const hero = game[side].hero;

        const $creatures = $('.creatures.' + side);

        game[side].creatures.forEach(minion => {
            var $container = $('<div>');

            render($container, 'creature', minion);

            $creatures.append($container.children());
        });

        $('.avatar.' + side + ' .health .value').text(hero.hp);

        $('.stats.' + side + ' .mana .active').text(hero.mana);
        $('.stats.' + side + ' .mana .all').text(hero.crystals);
    });

    $('.end-turn').toggleClass('active', game.my.active);

}

