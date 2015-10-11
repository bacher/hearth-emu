
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const H = require('../namespace');

H.HandCard = class HandCard extends EventEmitter {
    constructor(player, card) {
        super();

        this.player = player;

        this.objType = 'hand-card';

        this.id = _.uniqueId('hand');
        this.base = card;

        this.cost = card.cost;
    }

    getBaseData() {
        const comboMode = this.base.combo && this.player.getPlayedCardCount() > 0;

        const base = this.base.getInfo(comboMode);

        var cost = this.cost;

        if (this.base.costCalc) {
            switch (this.base.costCalc) {
                case 'minus-minion-count':
                    cost -= this.player.creatures.getCount() + this.player.enemy.creatures.getCount();
                    break;
                case 'minus-weapon-attack':
                    const weapon = this.player.hero.weapon;
                    if (weapon) {
                        cost -= weapon.attack;
                    }
                    break;
                case 'minus-hand-card-count':
                    cost -= this.player.hand.getCount() - 1;
                    break;
                case 'minus-hand-card-op-count':
                    cost -= this.player.enemy.hand.getCount();
                    break;
                case 'minus-hero-loss-hp':
                    cost -= 30 - this.player.hero.hp;
                    break;
                case 'if-have-damaged-than-minus-4':
                    if (this.player.creatures.getAll().some(minion => {
                        const minionDetails = minion.getData;
                        return minionDetails.hp !== minionDetails.maxHp;
                    })) {
                        cost -= 4;
                    }
                    break;
                case 'minus-pirates-count':
                    cost -= this.player.creatures.getAllByRace(H.RACES.pirate).length;
                    break;

                case 'minus-deaths-count':
                    cost -= this.player.battle._thisTurnDead.length;
                    break;

                default:
                    console.warn('Unimplemented cost calc!');
                    throw 2;
            }

            if (cost < 0) {
                cost = 0;
            }
        }

        return {
            that: this,
            id: this.id,
            cost: cost,
            base: base,
            isComboMode: comboMode
        };
    }

    _modifyClientData(data) {
        data.flags = {};

        if (data.cost < data.base.cost) {
            data.flags['cheap'] = true;
        } else if (data.cost > data.base.cost) {
            data.flags['expensive'] = true;
        }

        if (this.player.active && this.player.hero.mana >= data.cost &&
            !this.base.playConditions.some(condition => !H.Conditions.check(condition, this))
        ) {
            data.flags['can-play'] = true;
        }

        if (this.base.type === H.CARD_TYPES.minion && data.base.targetsType) {
            if (this.base.isTargetsTypeOptional) {
                if (this.checkOptionalAct(data.base)) {
                    data.targetsType = true;
                }

            } else {
                data.targetsType = true;
            }
        } else {
            data.targetsType = !!data.base.targetsType;
        }

        data.type = data.base.type;
        data.pic = data.base.pic;

        if (data.isComboMode) {
            delete data.isComboMode;

            if (data.flags['can-play']) {
                data.flags['combo-mode'] = true;
            }
        }

        if (data.flags['can-play'] && this.base.additionActions) {
            data.flags['choose-action'] = true;
            data.additionActions = this.base.additionActions.map(card => {
                return {
                    id: card.id,
                    pic: card.pic,
                    isNeedTarget: !!card.targetsType
                };
            });
        }

        delete data.base;
    }

    reduceCost(amount) {
        this.cost -= amount;

        if (this.cost < 0) {
            this.cost = 0;
        }
    }

    checkOptionalAct(base) {
        const conditionName = base.optionalCondition.name;

        switch (conditionName) {
            case 'target-exists':
                const targets = H.TARGETS.getByTargetsType(this.player, base.targetsType, this);

                return targets.getCount();

            case 'hold':
                const race = H.RACES[base.optionalCondition.params[0]];

                return this.player.hand.getAllByRace(race).length;

            case 'reveal-minions':
                const myMinion = this.player.deck.getRandomCard(H.CARD_TYPES.minion);
                const opMinion = this.player.enemy.deck.getRandomCard(H.CARD_TYPES.minion);

                return myMinion && (!opMinion || myMinion.cost > opMinion.cost);

            default:
                console.warn('Unknown act condition');
                throw 1;
        }
    }
};

H.mixGameDataAccessors(H.HandCard);
