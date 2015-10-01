
H.Creatures = class Creatures {
    constructor(battle) {
        this._battle = battle;
        this.$node = battle.$node;

        this._gameData = null;
        this._prevData = null;

        this._$creaturesMy = this.$node.find('.creatures.my');
        this._$creaturesOp = this.$node.find('.creatures.op');

        this._bindEventListeners();
    }

    _bindEventListeners() {
        this.$node.on('mouseenter', '.creature', this._onMouseEnter.bind(this));
        this.$node.on('mouseout', '.creature', this._onMouseOut.bind(this));
    }

    update(gameData) {
        this._gameData = gameData;

        this._updateSide(this._$creaturesMy, 'my');
        this._updateSide(this._$creaturesOp, 'op');

        this._prevData = gameData;
    }

    _updateSide($creatures, side) {
        const creatures = this._gameData[side].creatures;
        const prevCreatures = this._prevData && this._prevData[side].creatures;

        const alreadyUpdated = [];

        if (prevCreatures) {
            prevCreatures.forEach(minion => {
                const updatedMinion = _.find(creatures, { id: minion.id });

                if (updatedMinion) {
                    const $minion = this._getNodeById(updatedMinion.id);

                    $minion[0].className = 'creature ' + this._getClasses(side, updatedMinion);

                    $minion.find('.attack').text(updatedMinion.attack);
                    $minion.find('.hp').text(updatedMinion.hp);

                    alreadyUpdated.push(updatedMinion.id);

                } else {
                    // FIXME Animation?
                    this._getNodeById(updatedMinion.id).remove();
                }
            });
        }

        creatures.forEach((minion, i) => {
            if (!_.contains(alreadyUpdated, minion.id)) {
                const classes = this._getClasses(side, minion);

                const $newMinion = render(null, 'creature', { minion, classes });

                H.insertAtIndex($creatures, $newMinion, i);
            }
        });
    }

    _getClasses(side, minion) {
        var classes = H.flattenFlags(minion.flags);

        if (side === 'my' && minion.flags['can-play']) {
            classes += ' available';
        }

        return classes;
    }

    _onMouseEnter(e) {
        const $minion = $(e.currentTarget);

        this._showDelay = setTimeout(() => {
            const position = $minion.offset();

            position.top -= 90;
            position.left += 80;

            this._$preview = render(null, 'minion-preview', { pic: $minion.find('IMG').attr('src') });

            this._$preview.css(position);

            this.$node.append(this._$preview);
        }, 300);
    }

    _onMouseOut() {
        clearTimeout(this._showDelay);

        if (this._$preview) {
            this._$preview.remove();
            this._$preview = null;
        }
    }

    _getNodeById(id) {
        return this.$node.find(`[data-id="${id}"]`);
    }
};
