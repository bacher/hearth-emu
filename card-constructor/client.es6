
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
const $weapon = $details.find('.weapon-info');

var maxCardId;
var cards = null;

var filterCardType = 0;
var filterClass = 0;

function drawCards() {
    $cards.empty();

    var c = cards;

    if (filterCardType) {
        c = c.filter(card => card.type === filterCardType);
    }

    if (filterClass) {
        c = c.filter(card => card.clas === filterClass);
    }

    c.forEach(card => {
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

    //drawCards();

    $('.cards-params')
        .on('change', '[name="card-type"]', e => {
            const $input = $(e.currentTarget);

            filterCardType = Number($input.val());

            drawCards();
        })
        .on('click', '.class-pic', e => {
            filterClass = $(e.currentTarget).data('class');

            drawCards();
        });

    $cards.on('click', '.card', e => {

        newCard();

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

        if (card.targetsType) {
            $spell.find('.targets').val(getRawTargetsType(card.targetsType));
        }

        $minion.hide();
        $spell.hide();
        $weapon.hide();

        if (card.type === CARD_TYPES.minion) {
            $minion.show();

            const minion = card.minion;
            $minion.find('.attack-maxhp').val(minion.attack + '/' + minion.maxHp);
            $minion.find('.minion-flags').val(minion.flags && minion.flags.join(','));
            $minion.find('.race').val(minion.race || 0);

            $minion.find('.events, .battlecry-target').val('');

            drawEvents($minion, card.minion.events);

        } else if (card.type === CARD_TYPES.weapon) {
            $weapon.show();

            $weapon.find('.attack-durability').val(card.attack + '/' + card.durability);
            $weapon.find('.events, .battlecry-target').val('');

            drawEvents($weapon, card.events);

        } else if (card.type === CARD_TYPES.spell) {
            $spell.show();

            $spell.find('.act-command').val('');
            $spell.find('.act-targets').val('');

            card.acts.forEach((act, i) => {
                const $act = $spell.find('.act').eq(i);

                var commandParamPart = '';
                if (act.params.length) {
                    commandParamPart = ':' + act.params.join(',');
                }
                $act.find('.act-command').val(act.name + commandParamPart);
                const $actTargets = $act.find('.act-targets');

                if (act.targetsType === 'not-need') {
                    $actTargets.val('not-need');

                } else if (act.targetsType) {
                    $actTargets.val(getRawTargetsType(act.targetsType));
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
            newCard();
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

            const targets = $details.find('.targets').val().trim();

            if (targets) {
                card.targetsType = parseTargetsType(targets);
            }

            if (card.type === CARD_TYPES.minion) {
                const attackMaxhpPart = $minion.find('.attack-maxhp').val().split(/[, \/]/);

                card.minion = {
                    attack: Number(attackMaxhpPart[0]),
                    maxHp: Number(attackMaxhpPart[1]),
                    flags: [],
                    race: Number($minion.find('.race').val())
                };

                const flagsString = $minion.find('.minion-flags').val();
                if (flagsString !== '') {
                    card.minion.flags = flagsString.split(',');
                }

                card.minion.events = parseEvents($minion);

            } else if (card.type === CARD_TYPES.weapon) {

                const attackDurParts = $weapon.find('.attack-durability').val().split(/[, \/]/).map(Number);

                card.attack = attackDurParts[0];
                card.durability = attackDurParts[1];

                card.events = parseEvents($weapon);

            } else if (card.type === CARD_TYPES.spell) {
                card.acts = $spell.find('.act').map((i, actNode) => {
                    const $act = $(actNode);

                    const command = $act.find('.act-command').val();
                    const targetsType = $act.find('.act-targets').val().trim();
                    const [name, params] = command.split(':').map(part => part.trim());

                    if (name) {
                        const actParams = params && params.split(/\s*,\s*/).map(tryParseNumber);

                        const act = {
                            name: name,
                            params: actParams || []
                        };

                        if (targetsType === 'not-need') {
                            act.targetsType = 'not-need';

                        } else if (targetsType) {
                            act.targetsType = parseTargetsType(targetsType);
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

    function newCard() {
        $details.find('.id').text('NEW_CARD');
        $details.find('INPUT').val('');
        $details.find('SELECT').val(0);
        $details.find('.type').val(1);
        $details.find('.class-pic').removeClass('active').eq(0).addClass('active');

        $details.find('.card-pic').attr('src', '');

        $minion.show();
        $spell.hide();
        $weapon.hide();
    }

    function checkType() {
        const type = Number($details.find('.type').val());

        $minion.toggle(type === CARD_TYPES.minion);
        $spell.toggle(type === CARD_TYPES.spell);
    }

    function tryParseNumber(value) {
        const number = Number(value);

        if (!isNaN(number)) {
            return number;
        } else {
            return value;
        }
    }

    function parseTargetsType(targetsTypeRaw) {
        const match = targetsTypeRaw.match(/^([^\.]+)(?:\.(.+))?$/);
        const targetsDetails = match[1].split('&');

        const targetsType = {
            names: targetsDetails
        };

        if (match[2]) {
            const mods = match[2].split('.');

            targetsType.modificators = mods.map(mod => {
                const modMatch = mod.match(/^([^(]+)(?:\(([^)])\))?/);

                return {
                    name: modMatch[1],
                    params: modMatch[2] && modMatch[2].split(',').map(tryParseNumber) || []
                };
            });
        }

        return targetsType;
    }

    function getRawTargetsType(targetsType) {
        var raw = targetsType.names.join('&');

        if (targetsType.modificators) {
            targetsType.modificators.forEach(mod => {
                raw += '.' + mod.name;

                if (mod.params) {
                    raw += '(' + mod.params.join(',') + ')';
                }
            });
        }

        return raw;
    }

    function drawEvents($root, events) {
        for (var prop in events) {
            const eventInfo = events[prop];

            var eventRaw = eventInfo.name;
            const params = eventInfo.params.join(',');

            if (params) {
                eventRaw += ':' + params;
            }

            $root.find('.event[data-type="' + prop + '"]').val(eventRaw);

            if (prop === 'battlecry') {
                $root.find('.battlecry-target').val(getRawTargetsType(eventInfo.targetsType));
            }
        }
    }

    function parseEvents($obj) {
        const events = {};

        ['start-turn', 'end-turn', 'battlecry', 'deathrattle', 'aura', 'custom'].forEach(type => {
            const event = $obj.find('.event[data-type="' + type + '"]').val().trim();

            if (event) {
                const eventParts = event.split(':');

                events[type] = {
                    name: eventParts[0],
                    params: eventParts.slice(1).map(tryParseNumber)
                };

                if (type === 'battlecry') {
                    events[type].targetsType = parseTargetsType($obj.find('.battlecry-target').val().trim());
                }
            }
        });

        return events;
    }

});
