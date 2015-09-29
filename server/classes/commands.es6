
const H = require('../namespace');


H.Commands = class Commands {
    constructor(commands) {
        this.commands = commands && commands.map(command => new H.Command(command)) || [];
    }

    addCommandAct(act) {
        this.commands.push(H.Command.createByAct(act));
    }

    addCommand(command) {
        this.commands.push(new H.Command(command));
    }

    addCommands(commands) {
        commands.forEach(command => {
            this.addCommand(command);
        });
    }

    getTargets(o) {
        return this.commands.map(command => command.getTargets(o));
    }

    act(o) {
        this.commands.forEach(command => command.act(o));
    }

};
