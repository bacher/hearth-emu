
const _ = require('lodash');
const H = require('../namespace');

H.Targets = class Targets {
    constructor(player) {
        this.player = player;

        this.my = {
            minions: [],
            hero: false
        };
        this.op = {
            minions: [],
            hero: false
        };
    }

    static parseUserData(player, params) {
        const targets = new H.Targets(player);

        const targetPlayer = (params.targetSide === 'op' ? player.enemy : player);

        if (params.target === 'hero') {
            targets.addHero(targetPlayer.hero);
        } else {
            const target = targetPlayer.creatures.getCreatureByCrid(params.target);

            targets.addMinion(target);
        }

        return targets;
    }

    addMinion(minion) {
        var destination;

        if (minion.player === this.player) {
            destination = this.my.minions;
        } else {
            destination = this.op.minions;
        }

        if (destination.indexOf(minion) === -1) {
            destination.push(minion);
        }
    }

    addMinions(minions) {
        minions.forEach(minion => this.addMinion(minion));
    }

    addHero(hero) {
        if (hero.player === this.player) {
            this.addMyHero();
        } else {
            this.addEnemyHero();
        }
    }

    addMyHero() {
        this.my.hero = true;
    }

    removeMyHero() {
        this.my.hero = false;
    }

    addEnemyHero() {
        this.op.hero = true;
    }

    merge(that) {
        ['my', 'op'].forEach(side => {
            this[side].hero = this[side].hero || that[side].hero;

            that[side].minions.forEach(minion => {
                if (this[side].minions.indexOf(minion) === -1) {
                    this[side].minions.push(minion);
                }
            });
        });

        return this;
    }

    forEach(func) {
        this.my.minions.forEach(func);
        this.op.minions.forEach(func);

        if (this.my.hero) {
            func(this.player.hero);
        }

        if (this.op.hero) {
            func(this.player.enemy.hero);
        }
    }

    intersect(that) {
        this.my.hero = this.my.hero && that.my.hero;
        this.op.hero = this.op.hero && that.op.hero;

        this.my.minions = _.intersection(this.my.minions, that.my.minions);
        this.op.minions = _.intersection(this.op.minions, that.op.minions);

        return this;
    }

    'random'(count) {
        const objects = this.my.minions.concat(this.op.minions);

        if (this.my.hero) {
            objects.push('my-hero');
        }

        if (this.op.hero) {
            objects.push('op-hero');
        }

        this.my = {
            minions: [],
            hero: false
        };

        this.op = {
            minions: [],
            hero: false
        };

        for (var i = 0; i < count && objects.length; ++i) {
            const index = Math.floor(Math.random() * objects.length);
            const obj = objects[index];
            objects.splice(index, 1);

            const side = this[obj.player === this.player ? 'my' : 'op'];

            if (obj === 'my-hero' || obj === 'op-hero') {
                side.hero = true;
            } else {
                side.minions.push(obj);
            }
        }
    }

    'attack-more'(than) {
        this._filterAll(obj => obj.attack > than);
    }

    'attack-less'(than) {
        this._filterAll(obj => obj.attack < than);
    }

    _filterAll(filterFunc) {
        this._filterMinions(filterFunc);

        if (this.my.hero) {
            this.my.hero = filterFunc(this.player.hero);
        }

        if (this.op.hero) {
            this.op.hero = filterFunc(this.player.enemy.hero);
        }
    }

    _filterMinions(filterFunc) {
        this.my.minions = this.my.minions.filter(filterFunc);
        this.op.minions = this.op.minions.filter(filterFunc);
    }

    getGameData() {
        return {
            my: {
                minions: this.my.minions.map(minion => minion.id),
                hero: this.my.hero

            },
            op: {
                minions: this.op.minions.map(minion => minion.id),
                hero: this.op.hero
            }
        };
    }
};
