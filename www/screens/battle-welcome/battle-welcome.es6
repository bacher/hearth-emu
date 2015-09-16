
H.Screens['battle-welcome'] = class BattleWelcomeScreen extends H.Screen {
    constructor() {
        super({
            gClass: 'bw',
            name: 'battle-welcome',
            hash: false
        });
    }

    _render() {
        render(this.$node, 'battle-welcome');
    }

    _show() {
        this.$node.show();

        setTimeout(() => {
            // FIXME: maybe not data at this moment
            this._drawRepickCards();
        }, 2500);
    }

    setBattleData(data) {
        const $welcome = this.$node.find('.welcome');

        const myClass = H.CLASSES_L[data.my.clas];
        const opClass = H.CLASSES_L[data.op.clas];

        $welcome.find('.hero.my').addClass(myClass);
        $welcome.find('.hero.op').addClass(opClass);
    }

    setPickCardsData(data) {
        this._repickCards = data;
    }

    _drawRepickCards() {
        this.$node.find('.welcome').hide();
        this.$node.find('.repick-layer').show();

        const $cards = this.$node.find('.repick-layer .cards');

        render($cards, 'repick-cards', { cards: this._repickCards });

        // FIXME
        if (H.checkParam('endturn')) {
            this.$node.find('.repick-layer .confirm').click();
        }
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.card-repick', e => {
                $(e.currentTarget).toggleClass('replace');
            })
            .on('click', '.confirm', () => {
                const $replacedCards = this.$node.find('.card-repick.replace');

                const replaceIds = $replacedCards.map((i, el) => $(el).data('id')).get();

                H.socket.send('replace-cards', replaceIds);

                const $repickLayer = this.$node.find('.repick-layer');

                $repickLayer.find('.title').hide();
                $repickLayer.find('.cards').addClass('waiting');
                $repickLayer.find('.confirm').hide();
                $repickLayer.find('.opponent-choosing').show();
            });
    }
};
