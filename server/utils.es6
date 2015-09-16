
const H = require('./namespace');


H.parseValue = function(value) {
    if (/\d+-\d+/.test(value)) {
        const dmgRandom = value.split('-').map(Number);

        value = dmgRandom[0] + Math.floor(Math.random() * (dmgRandom[1] - dmgRandom[0]));
    }

    return value;
};

H.mixGameDataAccessors = function(clas) {
    if (!clas.prototype.getData) {
        clas.prototype.getData = function() {
            return this.player.battle.auras.applyEffects(this);
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
