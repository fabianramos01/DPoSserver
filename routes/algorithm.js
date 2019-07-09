module.exports = function(server, app) {

    const io = require('socket.io')(server);

    const serverIO = io.of('/server');
    const clientIO = io.of('/client');

    let nodeNum = 0;
    let minNum = 4;
    let nodes = [];
    let servers = [];
    let process = [];

    serverIO.on('connection', (socket) => {
        servers.push(socket.id);
        console.log(`Servidor conectado con id: ${socket.id}`);

        socket.on('initiateVoting', () => {
            if(minNum <= nodes.length) {
                nodeNum = nodes.length;
            }
        });
    });

    clientIO.on('connection', (socket) => {
        nodes.push(new Node(socket.id, socket.request.connection.remoteAddress, socket.request.connection.remotePort));
        console.log(`Usuario conectado con id: ${socket.id}`);

        socket.on('clientHour', (data) => {

        });
    });

    app.get('/', (req, res) => {

    });

    function Node(id, ip, port) {
        this.id = id;
        this.ip = ip;
        this.port = port;
        this.votes = 0;
    }
};
