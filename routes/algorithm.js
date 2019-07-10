module.exports = function(server, app) {

    const io = require('socket.io')(server);

    const serverIO = io.of('/server');
    const nodeIO = io.of('/node');

    const delegatedNum = 3;
    const nodePercent = 0.1;

    let totalStakes = 0;
    let isVotation = false;
    let votes = 0;
    let nodes = [];
    // let servers = [];
    let process = [];

    serverIO.on('connection', (socket) => {
        // servers.push(socket.id);
        serverIO.emit('nodeList', {'list': nodes});
        console.log(`Servidor conectado con id: ${socket.id}`);

        socket.on('initiateVoting', () => {
            if(delegatedNum <= nodes.length) {
                isVotation = true;
                calculateStakes();
                nodeIO.emit('startVotation');
            }
        });
    });

    nodeIO.on('connection', (socket) => {
        if (!isVotation) {
            nodes.push(new Node(socket.id, socket.request.connection.remoteAddress, socket.request.connection.remotePort));
            console.log(`Usuario conectado con id: ${socket.id}`);
            serverIO.emit('nodeList', {'list': nodes});
        }

        socket.on('vote', (data) => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === data.id) {
                    nodes[i].votes  += data.stake;
                    break;
                }
            }
            votes++;
            if (votes === nodes.length) {
                selectDelegates();
            }
        });

        socket.on('task', (data) => {
           process.push(data.task);
           serverIO.emit('process', {'process': process});
        });

        socket.on('name', data => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === socket.id) {
                    nodes[i].name = data.name;
                    break;
                }
            }
        });
    });

    function selectDelegates() {
        votes = 0;
        sortNodes();
        serverIO.emit('resultVotation', {'nodes': nodes});
        if (nodes[delegatedNum-1].votes >= (totalStakes*nodePercent)) {
            nodeIO.emit('votationEnd');
        } else {
            nodeIO.emit('repeatVotation');
        }
    }

    function sortNodes() {
        nodes.sort(function (node1, node2) {
            return node2.stake - node1.stake;
        });
    }
    
    function calculateStakes() {
        totalStakes = 0;
        nodes.forEach(node => {
            totalStakes += node.stake;
        });
    }
    
    app.get('/', () => {

    });

    function Node(id, ip, port) {
        this.id = id;
        this.ip = ip;
        this.port = port;
        this.name = "";
        this.votes = 0;
        this.stake =  Math.random() * (6 - 1) + 1;
    }
};
