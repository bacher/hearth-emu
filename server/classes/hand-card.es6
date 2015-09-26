
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

        return {
            that: this,
            id: this.id,
            cost: base.cost,
            base: base,
            isComboMode: comboMode
        };
    }

    _modifyClientData(data) {
        data.flags = {};
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
