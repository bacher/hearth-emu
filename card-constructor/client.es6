
const CARD_TYPES = {
    minion: 1,
    spell: 2,
    weapon: 3,
    trap: 4
};

const $tpl = $('#tpl').removeAttr('id');

const $cards = $('.cards');
const $details = $('.card-details');

const $minion = $details.find('.minion-info');
const $spell = $details.find('.spell-info');

var maxCardId;
var cards = null;

function drawCards() {
    $cards.empty();

    cards.forEach(card => {
        const $card = $tpl.clone();

        $card.data('card', card);
        $card.find('.card-pic').attr('src', 'http://media-hearth.cursecdn.com/avatars/' + card.pic + '.png');

        $card.appendTo($cards);
    });
}

$.ajax('/cards.json').then(data => {

    if (window.location.search.toLowerCase() === '?byid') {
        data.cards = data.cards.sort((card1, card2) => card1.id - card2.id);
    }

    maxCardId = data.maxCardId;
    cards = data.cards;

    drawCards();

    $cards.on('click', '.card', e => {
        const $card = $(e.currentTarget);

        const card = $card.data('card');

        $details.find('.card-pic').attr('src', 'http://media-hearth.cursecdn.com/avatars/' + card.pic + '.png');
        $details.find('.id').text(card.id);
        $details.find('.name').val(card.name);
        $details.find('.class-pic').removeClass('active').eq(card.clas).addClass('active');
        $details.find('.cost').val(card.cost);
        $details.find('.pic').val(card.pic);
        $details.find('.type').val(card.type);
        $details.find('.card-flags').val(card.flags && card.flags.join(','));

        $minion.hide();
        $spell.hide();

        if (card.type === CARD_TYPES.minion) {
            $minion.show();

            const minion = card.minion;
            $minion.find('.attack-maxhp').val(minion.attack + '/' + minion.maxHp);
            $minion.find('.minion-flags').val(minion.flags && minion.flags.join(','));
            $minion.find('.race').val(minion.race || 0);

            $minion.find('.events').val('');

            for (var prop in card.minion.events) {
                $minion.find('.event[data-type=' + prop + ']').val(card.minion.events[prop]);
            }
        } else if (card.type === CARD_TYPES.spell) {
            $spell.show();

            $spell.find('.target').val(card.target);

            $spell.find('.act-command').val('');
            $spell.find('.act-targets').val('');

            card.acts.forEach((act, i) => {
                const $act = $spell.find('.act').eq(i);

                var commandParamPart = '';
                if (act.params.length) {
                    commandParamPart = ':' + act.params.join(',');
                }
                $act.find('.act-command').val(act.name + commandParamPart);

                if (act.targetsType) {
                    const targets = act.targetsType.names.reduce((base, name) => {
                        return base + '&' + name;
                    });

                    $act.find('.act-targets').val(targets);
                }

            });
        }

    });

    $details
        .on('change', '.type', () => {
            checkType();
        })
        .on('change', '.pic', () => {
            $details.find('.card-pic').attr('src', $details.find('.pic').val().trim());
        })
        .on('click', '.flag-suggest', e => {
            const $suggest = $(e.currentTarget);
            const $flags = $details.find('.' + $suggest.data('for'));

            const currentVal = $flags.val();
            $flags.val((currentVal ? currentVal + ',' : '') + $suggest.text());
        })
        .on('click', '.spell-btn', () => {
            $details.find('.type').val(2);
            checkType();
        })
        .on('click', '.new-btn', () => {
            $details.find('.id').text('NEW_CARD');
            $details.find('INPUT').val('');
            $details.find('SELECT').val(0);
            $details.find('.type').val(1);
            $details.find('.class-pic').removeClass('active').eq(0).addClass('active');

            $details.find('.card-pic').attr('src', '');

            $minion.show();
            $spell.hide();
        })
        .on('click', '.class-pic', e => {
            $(e.currentTarget).siblings().removeClass('active').end().addClass('active');
        })
        .on('click', '.save-btn', () => {

            var isNew = false;

            const card = {
                id: Number($details.find('.id').text()),
                name: $details.find('.name').val().trim(),
                cost: Number($details.find('.cost').val().trim()),
                pic: $details.find('.pic').val().trim(),
                clas: $details.find('.class-pic.active').data('class'),
                type: Number($details.find('.type').val()),
                flags: []
            };

            if (/^http/.test(card.pic)) {
                // http://media-hearth.cursecdn.com/avatars/148/202/208.png
                const match = card.pic.match(/avatars\/(.+)\.png$/);

                if (!match) {
                    alert('Bad pic', card.pic);
                    return;
                }
                card.pic = match[1];
            }

            const cardFlagsString = $details.find('.card-flags').val();

            if (cardFlagsString !== '') {
                card.flags = cardFlagsString.split(',');
            }

            if (isNaN(card.id)) {
                isNew = true;
                maxCardId++;
                card.id = maxCardId;

                $details.find('.id').text(card.id);
            }


            if (card.type === CARD_TYPES.minion) {
                const attackMaxhpPart = $minion.find('.attack-maxhp').val().split(/[, \/]/);

                card.minion = {
                    attack: Number(attackMaxhpPart[0]),
                    maxHp: Number(attackMaxhpPart[1]),
                    flags: [],
                    events: {},
                    race: Number($minion.find('.race').val())
                };

                const flagsString = $minion.find('.minion-flags').val();
                if (flagsString !== '') {
                    card.minion.flags = flagsString.split(',');
                }

                const st = $minion.find('.event[data-type=start-turn]').val().trim();
                const et = $minion.find('.event[data-type=end-turn]').val().trim();
                const cr = $minion.find('.event[data-type=cry]').val().trim();
                const de = $minion.find('.event[data-type=death]').val().trim();
                const au = $minion.find('.event[data-type=aura]').val().trim();
                const cu = $minion.find('.event[data-type=custom]').val().trim();

                if (st) card.minion.events['start-turn'] = st;
                if (et) card.minion.events['end-turn'] = et;
                if (cr) card.minion.events['cry'] = cr;
                if (de) card.minion.events['death'] = de;
                if (au) card.minion.events['aura'] = au;
                if (cu) card.minion.events['custom'] = cu;

            } else if (card.type === CARD_TYPES.spell) {

                card.target = $spell.find('.target').val() || 'not-need';

                card.acts = $spell.find('.act').map((i, actNode) => {
                    const $act = $(actNode);

                    const command = $act.find('.act-command').val();
                    const targetsType = $act.find('.act-targets').val().trim();
                    const [name, params] = command.split(':').map(part => part.trim());

                    if (name) {
                        const actParams = params && params.split(/\s*,\s*/).map(value => {
                            const number = Number(value);

                            if (!isNaN(number)) {
                                return number;
                            } else {
                                return value;
                            }
                        });

                        const act = {
                            name: name,
                            params: actParams || []
                        };

                        if (targetsType) {
                            const targetsDetails = targetsType.split('&');

                            act.targetsType = {
                                names: targetsDetails,
                                mergeType: 'intersect'
                            };
                        }

                        return act;
                    }
                }).get();
            }

            $.ajax({
                url: '/update.json',
                type: 'POST',
                data: JSON.stringify(card),
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                processData: false
            }).then(() => {
                if (isNew) {
                    cards.push(card);
                } else {
                    const index = _.findIndex(cards, { id: card.id});

                    if (index !== -1) {
                        cards[index] = card;
                    } else {
                        alert('F1323');
                    }
                }

                $details.find('.new-btn').click();

                drawCards();
            });
        });

    $details.find('.new-btn').click();

    function checkType() {
        const type = Number($details.find('.type').val());

        $minion.toggle(type === CARD_TYPES.minion);
        $spell.toggle(type === CARD_TYPES.spell);
    }

});
