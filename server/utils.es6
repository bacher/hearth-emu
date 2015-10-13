
const _ = require('lodash');
const H = require('./namespace');


H.parseValue = function(value) {
    if (/\d+-\d+/.test(value)) {
        const dmgRandom = value.split('-').map(Number);

        value = dmgRandom[0] + Math.floor(Math.random() * (dmgRandom[1] - dmgRandom[0]));
    }

    return value;
};

H.makeArray = function(value) {
    if (Array.isArray(value)) {
        return value;
    } else {
        return [value];
    }
};

H.mixGameDataAccessors = function(clas) {
    if (!clas.prototype.getData) {
        clas.prototype.getData = function() {
            if (!this.player) {
                console.warn(this);
            }

            var data = this.player.battle.auras.applyEffects(this.player, this);

            if (this._modifyData) {
                const newData = this._modifyData(data);

                if (newData) {
                    data = newData;
                }
            }

            return data;
        };
    }

    if (!clas.prototype.getClientData) {
        clas.prototype.getClientData = function() {
            var data = this.getData();
            delete data.that;

            if (this._modifyClientData) {
                const newData = this._modifyClientData(data);

                if (newData) {
                    data = newData;
                }
            }

            return data;
        };
    }
};

H.mixCustomEvents = function(clas) {
    clas.prototype._onBattle = function(eventName, method) {
        this._listeners = this._listeners || [];

        method = method.bind(this);
        this._listeners.push({
            eventName,
            method
        });
        this.player.battle.on(eventName, method);
    };

    clas.prototype.addCustomEvent = function(command, event = null) {
        event = event || command.event;

        const eventListener = H.EventFilters.getCallback(event, {
            player: this.player,
            minion: this
        }, this._onCustomEvent.bind(this, command));

        this._onBattle(eventListener.eventName, eventListener.callback);
    };
};

H.mixHitting = function(clas) {
    clas.prototype.tryHit = function(target) {
        const battle = this.player.battle;

        const eventMessage = {
            by: this,
            to: target,
            prevent: false
        };

        battle.emit('try-hit', eventMessage);

        if (!eventMessage.prevent) {
            this.hit(target);
        }
    };

    clas.prototype.hit = function(target, isCounterAttack) {
        const battle = this.player.battle;
        const myData = this.getData();

        if (myData.attack) {
            if (isCounterAttack) {
                battle.emit('counter-hit', {
                    by: this,
                    to: target
                });

            } else {
                battle.emit('hit', {
                    by: this,
                    to: target
                });

                this.setHitFlags();

                target.hit(this, true);
            }

            const isDamageDealt = target.dealDamage(myData.attack);

            if (!isCounterAttack) {
                battle.addBattleAction({
                    name: 'hit',
                    by: this.id,
                    to: target.id
                });
            }

            if (isDamageDealt) {
                if (myData.flags['freezer']) {
                    target.addFlag('freeze');
                }

                // FIXME Пробивает ли яд через щит?
                if (myData.flags['acid'] && target.objType !== 'hero') {
                    target.kill();
                }
            }
        }
    };
};

H.parseParams = function(paramNames, values) {
    const params = {};

    paramNames.forEach((paramName, i) => {
        params[paramName] = values[i];
    });

    return params;
};

H.getRandomElement = function(arr) {
    if (arr.length) {
        return arr[_.random(arr.length - 1)];
    } else {
        return null;
    }
};
