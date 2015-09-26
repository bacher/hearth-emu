
H.CHAT_MESSAGES = {
    'thanks': 'I thank you.',
    'well-played': 'Well played.',
    'greetings': 'Greetings, friend.',
    'sorry': 'Sorry that happened.',
    'oops': 'That was a mistake.',
    'threaten': 'The elements will destroy you!'
};

H.Chat = class Chat {
    constructor(battle) {
        this._battle = battle;
        this.$node = battle.$node;

        this._showed = false;

        this._bindEventListeners();
    }

    _bindEventListeners() {
        this.$node
            .on('contextmenu', '.avatar.my', this._onContextMenu.bind(this))
            .on('mouseleave', '.ballons-hide-zone', this._onMouseLeave.bind(this))
            .on('click', '.ballon', this._onClick.bind(this));
    }

    _onContextMenu(e) {
        e.preventDefault();

        if (this._showed) {
            this._hide();
        } else {
            this._render();
        }
    }

    _onMouseLeave() {
        this._hide();
    }

    _onClick(e) {
        const $ballon = $(e.currentTarget);

        const messageId = $ballon.data('msg');
        const message = H.CHAT_MESSAGES[messageId];

        this._battle.sendChatEmotion(message);

        this.showMessage('my', message);

        this._hide();
    }

    _hide() {
        this._$ballons.addClass('hiding');

        setTimeout(() => {
            this._$ballons.remove();
        }, 200);

        this._showed = false;
    }

    _render() {
        this._showed = true;

        this._$ballons = render(null, 'chat');

        this.$node.append(this._$ballons);
    }

    showMessage(side, text) {
        const $ballon = render(null, 'big-ballon', { text, side });

        this.$node.append($ballon);

        $ballon.on('animationend', () => {
            $ballon.remove();
        });
    }
};
