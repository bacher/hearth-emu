
const _ = require('lodash');
const H = require('../namespace');

H.Card = class Card {
    constructor(info) {
        this.id = info.id;
        this.name = info.name;
        this.type = info.type;
        this.cost = 1;//info.cost;
        this.costCalc = info.costCalc;
        this.clas = info.clas;
        this.pic = info.pic.match(/\/([^/]+?)(?:\.png)?$/)[1];
        this.flags = parseFlags(info.flags);
        this.targetsType = info.targetsType;
        this.customAction = info.customAction;
        this.conditions = info.conditions || [];

        if (info.additionActions) {
            process.nextTick(() => {
                this.additionActions = info.additionActions.map(cardName => {
                    return H.CARDS.getByName(cardName);
                });
            });
        }

        if (info.combo) {
            this.combo = info.combo;
        }

        if (info.type === H.CARD_TYPES.spell) {
            this.acts = new H.Commands(info.spell.acts);

            if (this.combo) {
                this.combo.acts = new H.Commands(info.combo.spell.acts);
            }

        } else if (info.type === H.CARD_TYPES.trap) {

            this.acts = H.Command.createByAct({
                name: 'play-trap-card',
                params: [],
                targetsType: 'not-need'
            });

            this.trap = {
                events: {}
            };

            this.trap.events['custom'] = info.trap.events['custom'].map(command => {
                return new H.Command(command);
            });

        } else if (info.type === H.CARD_TYPES.minion || info.type === H.CARD_TYPES.weapon) {
            this.acts = new H.Commands();

            var activation;
            var object;

            if (info.type === H.CARD_TYPES.minion) {
                activation = 'card-summon';
                this.minion = object = info.minion;

                this.conditions = ['can-add-creature'].concat(this.conditions);

            } else {
                activation = 'equip-weapon-card';
                this.weapon = object = info.weapon;
            }

            object.flags = parseFlags(object.flags);

            this.acts.addCommandAct({
                name: activation,
                params: [this.id],
                targetsType: 'not-need'
            });

            if (this.combo) {
                this.combo.acts = new H.Commands();

                this.combo.acts.addCommandAct({
                    name: activation,
                    params: [this.id],
                    targetsType: 'not-need'
                });
            }

            processEvents(this, object.events);

            if (this.combo) {
                processEvents(this.combo, this.combo.object.events);
            }
        }

        this._saveVariants();
    }

    getInfo(isCombo, isClient) {
        if (isClient) {
            return {
                id: this.id,
                name: this.name,
                clas: this.clas,
                type: this.type,
                cost: this.cost,
                pic: this.pic,
                flags: this.flags
            };
        } else {
            if (isCombo && this._comboCopy) {
                return this._comboCopy;
            } else {
                return this._normalCopy;
            }
        }
    }

    _saveVariants() {
        this._normalCopy = _.clone(this);

        this._normalCopy.that = this;

        delete this._normalCopy.combo;

        if (this.combo) {
            this._comboCopy = _.clone(this._normalCopy);

            var eventsDestination;

            if (this.type === H.CARD_TYPES.minion) {
                this._comboCopy.minion = _.clone(this._comboCopy.minion);
                eventsDestination = this._comboCopy.minion;

            } else if (this.type === H.CARD_TYPES.weapon) {
                this._comboCopy.weapon = _.clone(this._comboCopy.weapon);
                eventsDestination = this._comboCopy.weapon;
            }

            for (var prop in this.combo) {
                if (prop === 'object' && eventsDestination) {
                    eventsDestination.events = this.combo.object.events;
                } else {
                    this._comboCopy[prop] = this.combo[prop];
                }
            }
        }
    }

};

function parseFlags(flags) {
    const flagsHash = {};

    if (flags) {
        flags.forEach(flag => {
            flagsHash[flag] = true;
        });
    }

    return flagsHash;
}

function processEvents(obj, events) {
    for (var eventTypeName in events) {
        const commands = events[eventTypeName];

        if (eventTypeName === 'battlecry') {
            obj.acts.addCommands(commands);

        } else if (_.contains(['deathrattle', 'end-turn', 'start-turn'], eventTypeName)) {
            events[eventTypeName] = new H.Commands(commands);

        } else if (eventTypeName === 'custom') {
            events[eventTypeName] = commands.map(command => {
                return new H.Command(command);
            });
        }
    }
}
