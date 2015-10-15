
H.Screens['dialog'] = class DialogScreen extends H.Screen {
    constructor(params = {}) {
        super({
            gClass: 'di',
            name: 'dialog',
            hash: false
        });

        this._title = params.title;
        this._okText = params.okText || 'Ok';
        this._cancelText = params.cancelText || 'Cancel';
    }

    _render() {
        render(this.$node, 'dialog');

        this.$body = this.$node.find('.body');

        this.$node.find('.title').text(this._title);
        this.$node.find('.ok').text(this._okText);
        this.$node.find('.cancel').text(this._cancelText);

        this._renderBody();
    }

    /** @virtual */
    _renderBody() {}

    _onShow() {
        this.$node.find('.email').focus();
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.ok', this._onOk.bind(this))
            .on('click', '.cancel', this._onCancel.bind(this));
    }

    /** @virtual */
    _onOk() {}

    _onCancel() {
        this.close();
    }

    close() {
        this.hideThenDestroy();
    }
};
