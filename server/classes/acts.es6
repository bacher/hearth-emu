
const H = require('../namespace');


H.Acts = class Acts {
    constructor(commands) {
        this.commands = commands || [];

        this.commands.forEach(command => {
            this.addActFuncs(command);
        });
    }

    addActFuncs(command) {
        command.acts.forEach(act => {
            act.actFunc = H.ACTIVATIONS.getByName(act.name);
        });
    }

    addCommand(command) {
        if (command.name) {
            command.acts = [{
                name: command.name,
                params: command.params
            }];

            delete command.name;
            delete command.params;
        }

        this.addActFuncs(command);
        this.commands.push(command);
    }

    addCommands(commands) {
        commands.forEach(command => {
            this.addCommand(command);
        });
    }

    getTargets(o) {
        return this.commands.map(command => {
            return H.TARGETS.getByTargetsType(o.player, command.targetsType, o.handCard);
        });
    }

    act(o) {
        this.commands.forEach(command => {
            var targets;

            if (command.targetsType === 'not-need') {
                targets = null;

            } else if (command.targetsType) {
                targets = H.TARGETS.getByTargetsType(o.player, command.targetsType, o.handCard);

            } else {
                targets = o.globalTargets;
            }

            command.acts.forEach(act => {
                act.actFunc({
                    battle: o.battle,
                    player: o.player,
                    handCard: o.handCard,
                    targets: targets,
                    params: o.data
                });
            });
        });
    }

};
