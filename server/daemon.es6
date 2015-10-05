
const cluster = require('cluster');
var lastStart = 0;

if (cluster.isMaster) {
    startFork();

    cluster.on('exit', function(worker, code) {
        console.warn('Slave process died, ERRORCODE: ' + code);

        if (Date.now() - lastStart < 3000) {
            setTimeout(startFork, 10000);
        } else {
            setTimeout(startFork, 2000);
        }

    });
} else {
    require('./server');
}

function startFork() {
    lastStart = Date.now();

    cluster.fork();
}
