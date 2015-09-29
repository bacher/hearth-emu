
const H = require('../namespace');

H.HeroSkill = class HeroSkill {
    constructor(hero, options) {
        this._hero = hero;

        this.command = H.Command.createByAct({
            name: options.activation,
            params: options.params || [],
            animation: options.animation
        });

        this._needTarget = options.skillNeedTarget;
        this._targets = options.targets;
        this._cost = options.cost || 2;
        this._additionCheck = options.additionCheck;

        this._used = false;
    }

    use(o) {
        this.command.act(o);

        this._used = true;
    }

    charge() {
        this._used = false;
    }

    canUseSkill() {
        return (
            this._hero.player.active &&
            !this._used &&
            this._hero.mana >= this.getCost() &&
            (!this._additionCheck || this._additionCheck())
        );
    }

    isUsed() {
        return this._used;
    }

    getCost() {
        return this._cost;
    }

    isNeedTarget() {
        return !!this._needTarget;
    }

    getTargetsType() {
        return this._targets;
    }
};
