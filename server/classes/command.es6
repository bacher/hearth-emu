
const H = require('../namespace');


H.Command = class Command {
    constructor(command) {
        if (command.name) {
            command.acts = [{
                name: command.name,
                params: command.params
            }];

            delete command.name;
            delete command.params;
        }

        this.acts = command.acts;
        this.event = command.event;
        this.targetsType = command.targetsType;

        this.addActFuncs();
    }

    addActFuncs() {
        this.acts.forEach(act => {
            act.actFunc = H.ACTIVATIONS.getByName(act.name);
        });
    }

    getTargets(o) {
        return H.TARGETS.getByTargetsType(o.player, this.targetsType, o.handCard);
    }

    act(o) {
        var targets;

        if (this.targetsType === 'not-need') {
            targets = null;

        } else if (this.targetsType) {
            if (this.targetsType.names[0] === 'target') {
                targets = o.globalTargets.clone();

                targets.applyModificators(this.targetsType.modificators);

            } else {
                targets = H.TARGETS.getByTargetsType(o.player, this.targetsType, o.handCard, o.minion);
            }

        } else {
            targets = o.globalTargets;
        }

        this.acts.forEach(act => {
            act.actFunc({
                battle: o.battle,
                player: o.player,
                handCard: o.handCard,
                minion: o.minion,
                params: o.params,
                eventMessage: o.eventMessage,
                targets: targets
            });
        });
    }

};
