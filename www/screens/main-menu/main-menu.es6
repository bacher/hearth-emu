
H.Screens['main-menu'] = class MainMenuScreen extends H.Screen {
    constructor(params = {}) {
        super({
            gClass: 'mm',
            name: 'main-menu'
        });

        this._longLoad = params.longLoad;
    }

    _render() {
        render(this.$node, 'main-menu');

        setTimeout(() => {
            this.$node.find('.disk').addClass('ready');
            this.$node.find('.footer')
                .addClass('ready')
                .one('transitionend', () => {
                    this.$node.addClass('loaded');
                });
        }, this._longLoad ? 1500 : 500);


        this._updateStatistic();

        this._statisticUpdateInterval = setInterval(() => {
            this._updateStatistic();
        }, 5000);
    }

    _bindEventListeners() {
        this.$node
            .on('click', '.play', () => {
                H.app.activateScreen('start-game-menu');
            })
            .on('click', '.my-collection', () => {
                H.app.activateScreen('collection');
            });
    }

    _unbindEventListeners() {
        clearInterval(this._statisticUpdateInterval);
    }

    _hide() {
        return new Promise(resolve => {
            this.$node.find('.disk').removeClass('ready');

            setTimeout(() => {
                this.$node.hide();

                resolve();
            }, 500);
        });
    }

    _updateStatistic() {
        $.ajax('/online.json').then(data => {
            this.$node.find('.statistic .value').text(data.online);
        });
    }
};
