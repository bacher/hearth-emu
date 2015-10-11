
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
    clas.prototype.hit = function(target) {
        const battle = this.player.battle;

        const eventMessage = {
            by: this,
            to: target,
            prevent: false
        };

        battle.emit('hit', eventMessage);

        if (!eventMessage.prevent) {
            const by = eventMessage.by.getData();
            const to = eventMessage.to.getData();

            const isDamageDealt = eventMessage.to.dealDamage(by.attack);

            battle.addBattleAction({
                name: 'hit',
                by: by.id,
                to: target.id
            });

            if (isDamageDealt) {
                if (by.flags['freezer']) {
                    eventMessage.to.addFlag('freeze');
                }

                // FIXME Пробивает ли яд через щит?
                if (by.flags['acid'] && eventMessage.to.objType !== 'hero') {
                    eventMessage.to.kill();
                }
            }

            if (to.attack && eventMessage.to.objType !== 'hero') {
                const isCounterDamageDealt = eventMessage.by.dealDamage(to.attack);

                if (isCounterDamageDealt) {
                    if (to.flags['freezer']) {
                        eventMessage.by.addFlag('freeze');
                    }

                    if (to.flags['acid'] && eventMessage.by.objType !== 'hero') {
                        eventMessage.by.kill();
                    }
                }
            }
        }

        this.setHitFlags();
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
