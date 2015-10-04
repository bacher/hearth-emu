
const cluster = require('cluster');

if (cluster.isMaster) {
    startFork();

    cluster.on('exit', function(worker, code) {
        console.warn('Slave process died, ERRORCODE: ' + code);

        setTimeout(startFork, 2000);
    });
} else {
    require('./server');
}

function startFork() {
    cluster.fork();
}
