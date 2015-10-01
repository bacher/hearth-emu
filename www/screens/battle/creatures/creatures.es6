
H.Creatures = class Creatures {
    constructor(battle) {
        this._battle = battle;
        this.$node = battle.$node;

        this._gameData = null;
        this._prevData = null;

        this._$creaturesMy = this.$node.find('.creatures.my');
        this._$creaturesOp = this.$node.find('.creatures.op');

        this._emptySpace = false;
        this._$stab = $('<DIV>');

        this._minionsPositions = null;

        this._bindEventListeners();
    }

    _bindEventListeners() {
        this.$node.on('mouseenter', '.creature', this._onMouseEnter.bind(this));
        this.$node.on('mouseout', '.creature', this._hidePreview.bind(this));

        this.$node.on('arrow-mode', this._hidePreview.bind(this));
    }

    update(gameData) {
        this._gameData = gameData;

        this.clearEmptySpace();

        if (this._$battlecryPreview) {
            this._$battlecryPreview.remove();
        }

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
                    this._getNodeById(minion.id).remove();
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

        if (prevCreatures) {
            $creatures.removeClass('count' + prevCreatures.length);
        }

        $creatures.addClass('count' + creatures.length);
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
            if (this.$node.hasClass('normal-mode')) {
                const position = $minion.offset();

                position.top -= 90;
                position.left += 80;

                this._$preview = render(null, 'minion-preview', { pic: $minion.find('IMG').attr('src') });

                this._$preview.css(position);

                this.$node.append(this._$preview);
            }
        }, 400);
    }

    _hidePreview() {
        clearTimeout(this._showDelay);

        if (this._$preview) {
            this._$preview.remove();
            this._$preview = null;
        }
    }

    _getNodeById(id) {
        return this.$node.find(`[data-id="${id}"]`);
    }

    _calcCreaturesCount(side) {
        if (!side || side === 'my') {
            this._$creaturesMy[0].className = this._$creaturesMy[0].className.replace(/\bcount\d\b/g, '') + ' count' + this._$creaturesMy.children().length;
        }

        if (!side || side === 'op') {
            this._$creaturesOp[0].className = this._$creaturesOp[0].className.replace(/\bcount\d\b/g, '') + ' count' + this._$creaturesOp.children().length;
        }
    }

    makeEmptySpaceUnderMouse(mouse) {
        if (!this._emptySpace) {
            const $minions = this._$creaturesMy.children();

            this._minionsPositions = $minions.map((i, node) => {
                const $minion = $(node);

                return $minion.offset().left + $minion.outerWidth() / 2;
            }).get();
        }

        const x = mouse.x;

        if (!this._minionsPositions.some((pos, i) => {
            if (x < pos) {
                this._$stab.insertBefore($('.my .creature').eq(i));
                return true;
            }
        })) {
            this._$creaturesMy.append(this._$stab);
        }

        this._emptySpace = true;

        this._calcCreaturesCount('my');
    }

    clearEmptySpace() {
        this._emptySpace = false;
        this._$stab.detach();

        this._calcCreaturesCount('my');
    }

    clearBattlecryPreview() {
        if (this._$battlecryPreview) {
            this._$battlecryPreview.remove();
            this._$battlecryPreview = null;
        }
        
        this._calcCreaturesCount();
    }

    getEmptySpaceIndex() {
        return this._$stab.index();
    }

    replaceEmptySpaceByPreview($minion) {
        this._$stab.replaceWith($minion);
        this._$battlecryPreview = $minion;
    }
};
