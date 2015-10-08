
const Menu = H.Screens['menu'];

H.Screens['new-deck-menu'] = class NewDeckMenuScreen extends Menu {
    constructor() {
        super({
            position: {
                x: 649,
                y: 332
            }
        });
    }

    getItems() {
        return [
            { id: 'manual', label: 'Manual' },
            //{ id: 'ready', label: 'From Ready' },
            { id: 'import', label: 'Import' }
        ];
    }

    onSelect(id) {
        switch (id) {
            case 'manual':
                const chooseHero = H.app.activateOverlay('choose-hero-deck', {
                    onlyBasic: true,
                    onChoose: selectInfo => {
                        const clas = selectInfo.heroClass;
                        const className = H.CLASSES_L[clas];

                        const deckInfo = {
                            label: 'Custom ' + _.capitalize(className),
                            clas: clas,
                            cardIds: [],
                            id: _.random(10000)
                        };

                        H.decks.push(deckInfo);

                        H.saveDecks();

                        H.app.getActiveScreen().deckCreated(deckInfo.id);

                        chooseHero.close();
                    },
                    onBack: () => {
                        chooseHero.close();
                    }
                });

                break;

            case 'ready':
                console.warn('READY');
                break;

            case 'import':
                const url = prompt('Enter deck resource URL');

                if (url) {
                    $.get('/import.json?url=' + encodeURI(url)).then(data => {
                        if (data.ok) {
                            const deck = data.deck;

                            deck.id = _.random(1000);

                            H.decks.push(deck);
                            H.saveDecks();

                            H.emit('decks-updated');

                        } else {
                            alert('Sorry. We could not parse deck...\nError logged and will be fixed.');
                        }
                    });
                }
                break;
        }
    }
};
