
H.Screens['choose-hero-deck'] = class ChooseHeroDeckScreen extends H.Screen {
    constructor(params) {
        super({
            gClass: 'chd',
            name: 'choose-hero-deck',
            hash: false
        });

        this._isOnlyBasic = params.onlyBasic || false;
        this._initialMode = this._isOnlyBasic ? 'basic' : (params.mode || 'custom');
        this._okButtonClass = params.okButtonType || 'choose';
        this._onChoose = params.onChoose;
        this._onBack = params.onBack;
        this._onHighlight = params.onHighlight || $.noop;

        this._selection = {};

        H.loadDecks();
    }

    _render() {
        render(this.$node, 'choose-hero-deck', {
            onlyBasic: this._isOnlyBasic,
            decks: H.decks
        });

        this._$type = this.$node.find('.select-decks-type');
        this.$node.find('.ok').addClass(this._okButtonClass);

        this._switchMode(this._initialMode);
    }

    _onShow() {
        if (H.activeDeck && !this._isOnlyBasic) {
            this.$node.find('.deck[data-id="' + H.activeDeck.id + '"]').click();
        }
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.hero:not(.selected)', e => {
                const $hero = $(e.currentTarget);

                $hero.siblings().removeClass('selected');
                $hero.addClass('selected');

                const clas = $hero.data('clas');

                this._showAvatar(clas, H.HERO_NAMES[clas]);

                this._selection = { heroClass: clas };

                this._onHighlight(this._selection);
            })
            .on('click', '.deck:not(.selected)', e => {
                const $deck = $(e.currentTarget);

                this.$node.find('.deck.selected').removeClass('selected');
                $deck.addClass('selected');

                const deckId = $deck.data('id');

                const deckInfo = _.find(H.decks, { id: deckId });

                this._showAvatar(deckInfo.clas, deckInfo.label);

                this._selection = { deckId };

                this._onHighlight(this._selection);
            })
            .on('click', '.select-decks-type .left', () => {
                this._switchMode('basic');
            })
            .on('click', '.select-decks-type .right', () => {
                this._switchMode('custom');
            })
            .on('click', '.ok', () => {
                this._onChoose(this._selection);
            })
            .on('click', '.back', () => {
                this._onBack();
            });
    }

    _showAvatar(clas, label) {
        this.$node.find('.avatar')
            .removeClass()
            .addClass('avatar')
            .addClass(H.CLASSES_L[clas]);

        this.$node.find('.hero-details .label').text(label);

        this.$node.find('.ok').show();
    }

    _switchMode(mode) {
        this._$type.removeClass('basic custom').addClass(mode);

        const panelClass = mode === 'basic' ? '.heroes' : '.decks';

        this.$node.find('.panel').hide().filter(panelClass).show();
    }

    close() {
        this.hideThenDestroy();
    }
};
