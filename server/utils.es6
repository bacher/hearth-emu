
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
            var data = this.player.battle.auras.applyEffects(this);

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

H.parseParams = function(paramNames, values) {
    const params = {};

    paramNames.forEach((paramName, i) => {
        params[paramName] = values[i];
    });

    return params;
};

H.getRandomElement = function(arr) {
    if (arr.length) {
        return null;
    } else {
        return arr[_.random(arr.length - 1)];
    }
};
