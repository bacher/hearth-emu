
const cluster = require('cluster');
var lastStart = 0;

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
    var start = Date.now();

    if (start - lastStart > 3000) {
        cluster.fork();

        lastStart = start;
    }
}
