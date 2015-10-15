
const Dialog = H.Screens['dialog'];

H.Screens['feedback'] = class extends Dialog {
    constructor() {
        super({
            title: 'Feedback',
            okText: 'Send'
        });
    }

    _renderBody() {
        render(this.$body, 'feedback');
    }

    _onOk() {
        const email = this.$body.find('.email').val();
        const text = this.$body.find('.text').val();

        if (text) {
            $.ajax({
                url: '/feedback.json',
                method: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    email,
                    text
                })
            }).then(data => {
                if (data.status === 'ok') {
                    this.close();
                } else {
                    alert('ERROR, sorry');
                }
                this.close();
            }).fail(error => {
                alert('ERROR, sorry');
            });

        } else {
            this.$body.find('.text').addClass('highlight').focus();
        }
    }
};
