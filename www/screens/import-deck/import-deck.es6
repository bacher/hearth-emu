
const Dialog = H.Screens['dialog'];

H.Screens['import-deck'] = class extends Dialog {
    constructor() {
        super({
            title: 'Import Deck',
            okText: 'Import'
        });
    }

    _renderBody() {
        render(this.$body, 'import-deck');
    }

    _onOk() {
        const url = this.$body.find('.url').val();

        if (url) {
            $.ajax({
                url: '/import.json?url=' + encodeURI(url),
                method: 'POST'
            }).then(data => {
                if (data.status === 'ok') {
                    const deck = data.deck;

                    deck.id = _.random(1000);

                    H.decks.push(deck);
                    H.saveDecks();

                    H.emit('decks-updated');

                } else {
                    alert('Sorry. Parser could not parse deck...\nError logged and will be fixed.');
                }

                this.close();
            }).fail(error => {
                alert('Sorry. Parser could not parse deck...\nError logged and will be fixed.');

                this.close();
            });

            this.disableButtons();

            this.$body.find('.base').hide();
            this.$body.find('.spinner').show();

        } else {
            this.$body.find('.url').addClass('highlight').focus();
        }
    }
};
