
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const H = require('../namespace');


H.GameObject = class GameObject extends EventEmitter {
    constructor(handCard, card) {
        super();

        this.handCard = handCard;

        if (this.handCard) {
            this.card = this.handCard.base;
        } else {
            this.card = card;
        }
    }

    enterInGame(player) {
        this.battle = player.battle;
        this.player = player;

        delete this.flags['dead'];
        delete this.flags['detached'];

        this.events = _.clone(this.base.events);

        if (this.events['aura']) {
            this.events['aura'].forEach(aura => {
                H.Aura.addAura(player, this, aura);
            });
        }

        if (this.events['enrage']) {
            this.events['enrage'].forEach(aura => {
                H.Aura.addEnrage(player, this, aura);
            });
        }

        if (this.events['custom']) {
            this.events['custom'].forEach(command => this.addCustomEvent(command));
        }
    }

    getFlags() {
        const flags = _.clone(this.flags);

        return this._processFlags(flags);
    }

    _modifyData(data) {
        data.flags = this._processFlags(data.flags);
    }

    _processFlags(flags) {
        delete flags['tired'];

        if (flags['freeze'] || flags['sleep'] || flags['cant-attack']) {
            flags['tired'] = true;

        } else if (flags['hit']) {
            if (flags['windfury']) {
                if (flags['second-hit']) {
                    flags['tired'] = true;
                }
            } else {
                flags['tired'] = true;
            }
        }

        return flags;
    }

    setHitFlags() {
        if (this.flags['hit']) {
            this.flags['second-hit'] = true;
        } else {
            this.flags['hit'] = true;
        }

        delete this.flags['stealth'];
    }

    _detachListeners() {
        if (this._listeners) {
            this._listeners.forEach(info => {
                this.player.battle.removeListener(info.eventName, info.method);
            });
            this._listeners.length = 0;
        }
    }

    onStartTurn() {
        delete this.flags['sleep'];
        delete this.flags['hit'];
        delete this.flags['second-hit'];

        if (this.events['start-turn']) {
            this.events['start-turn'].act({
                battle: this.player.battle,
                player: this.player,
                minion: this
            });
        }
    }

    onEndTurn() {
        delete this.flags['freeze'];
        delete this.flags['sleep'];

        if (this.events['end-turn']) {
            this.events['end-turn'].act({
                battle: this.player.battle,
                player: this.player,
                minion: this
            });
        }
    }

    detach() {
        if (!this.flags['detached']) {
            this._detachListeners();

            this.flags['detached'] = true;

            this.emit('detach', this);

            this.player = null;
        }
    }

    kill() {
        if (!this.flags['dead']) {
            this.player.battle.emit('death', this);

            this._playDeathrattles();

            this.detach();

            this.flags['dead'] = true;

            this.emit('death', this);
        }
    }

    is(flag) {
        return !!this.flags[flag];
    }

    removeFlag(flag) {
        delete this.flags[flag];
    }

    _playDeathrattles() {
        if (this.events['deathrattle']) {
            this.events['deathrattle'].act({
                battle: this.player.battle,
                player: this.player,
                minion: this
            });
        }
    }

    _onCustomEvent(command, eventMessage, globalTargets) {
        command.act({
            battle: this.battle,
            player: this.player,
            minion: this,
            globalTargets,
            eventMessage
        });

        if (this.card.type === H.CARD_TYPES['trap']) {
            this.battle.emit('play-secret', this.player);

            this.battle.addBattleAction({
                name: 'play-secret',
                player: this.player.id,
                pic: this.card.pic
            });

            this.detach();
        }
    }
};

H.mixCustomEvents(H.GameObject);
