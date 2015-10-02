
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
    }

    getBaseData() {
        const comboMode = this.base.combo && this.player.getPlayedCardCount() > 0;

        const base = this.base.getInfo(comboMode);

        var cost = base.cost;

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
            !this.base.conditions.some(condition => !H.Conditions.check(condition, this))
        ) {
            data.flags['can-play'] = true;
        }

        if (data.base.targetsType) {
            data.flags['need-battlecry-target'] = true;
        }

        data.type = data.base.type;
        data.targetsType = !!data.base.targetsType;
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
};

H.mixGameDataAccessors(H.HandCard);
