
H.Socket = class Socket {
    constructor(socket) {

        this._socket = socket;

        this._socket.onopen = this._onOpen.bind(this);
        this._socket.onclose = this._onClose.bind(this);
        this._socket.onmessage = this._onMessage.bind(this);
        this._socket.onerror = error => {
            console.warn('Socket Error', error.message);
        };

        this._listeners = {};
    }

    _onOpen() {
        var name;
        const nameMatch = window.location.search.match(/[?&]name=([^&]*)/);

        if (nameMatch) {
            name = nameMatch[1];
        } else {
            name = 'Random_' + Math.floor(Math.random() * 100 + 1);
        }

        H.loadDecks();

        const deck = H.playDeck || H.activeDeck;

        if (deck) {
            H.socket.send('join', {
                name: name,
                deck: deck
            });
        } else {
            window.alert('Deck is not selected');
        }
    }

    _onMessage(event) {
        const message = JSON.parse(event.data);

        const msg = message.msg;
        const data = message.data;

        console.log('Server Message:', message);

        const callbacks = this._listeners[msg];

        if (callbacks) {
            callbacks.forEach(callback => {
                callback(data);
            });
        } else {
            console.warn('Unhandled Message:', msg);
        }
    }

    _onClose(event) {
        if (!event.wasClean) {
            console.log('Обрыв соединения');
            console.warn('Code:', event.code);

            H.app.activateScreen('connection-lost');

            if (H.checkParam('autoreload')) {
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        }
    }

    send(msg, data) {
        const packet = { msg, data: data || null };

        console.log('Client Message:', packet);

        this._socket.send(JSON.stringify(packet));
    }

    on(eventName, callback) {
        if (!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }

        this._listeners[eventName].push(callback);
    }

    off(eventName, callback) {
        if (this._listeners[eventName]) {
            this._listeners[eventName] = this._listeners[eventName].filter(func => func !== callback);
        }
    }

};
