
H.Animations = class Animations {
    constructor(battle, animations) {
        this._battle = battle;
        this.$node = battle.$node;
        this.animations = animations;
    }

    play() {
        return Promise.all(this.animations.map(animation => {
            switch (animation.name) {
                case 'hit':
                    return this._startHitAnimation(animation);
                    break;
            }

            return Promise.resolve();
        }));
    }

    _startHitAnimation(animation) {
        return new Promise(resolve => {
            const $by = this.$node.find(`.creature[data-id="${animation.by}"]`);
            const $to = this.$node.find(`.creature[data-id="${animation.to}"]`);

            const byPosition = $by.offset();
            const toPosition = $to.offset();
            const deltaX = toPosition.left - byPosition.left;
            const deltaY = toPosition.top - byPosition.top;

            $by.css('transform', `translate(${deltaX}px,${deltaY}px)`);

            setTimeout(() => {
                const $splash = render(null, 'splash', { damage: 4 });

                $splash.css('transform', `translate(${toPosition.left}px,${toPosition.top}px)`);

                $splash.appendTo(this.$node);
                $by.css('transform', '');

                //$splash.on('animationend', () => {
                setTimeout(() => {
                    $splash.remove();

                    resolve();
                }, 1000);
            }, 300);
        });
    }
};
