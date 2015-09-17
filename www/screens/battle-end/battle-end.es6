
H.Screens['battle-end'] = class BattleEndScreen extends H.Screen {
    constructor(params) {
        super({
            gClass: 'be',
            name: 'battle-end',
            hash: false
        });

        this._isWin = params.win;
        this._className = params.className;
    }

    _render() {
        render(this.$node, 'battle-end', {
            isWin: this._isWin,
            className: this._className
        });
    }

    _bindEventListeners() {
        this.$node.on('click', () => {
            H.app.getActiveScreen().onBattleEndSplashClose();
        });
    }
};
