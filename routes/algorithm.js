module.exports = function(server) {

    const io = require('socket.io')(server);

    const serverIO = io.of('/server');
    const nodeIO = io.of('/node');

    const delegatedNum = 1;
    const nodePercent = 0.08;

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
                resetVotes();
                serverIO.emit('nodeList', {'list': nodes});
                nodeIO.emit('startVotation', {'list': nodes});
            } else {
                serverIO.to(socket.id).emit('invalidVotation');
            }
        });
    });

    nodeIO.on('connection', (socket) => {
        if (!isVotation) {
            let node = new Node(socket.id, socket.request.connection.remoteAddress, socket.request.connection.remotePort)
            nodes.push(node);
            console.log(`Usuario conectado con id: ${node.id}`);
            serverIO.emit('nodeList', {'list': nodes});
        }

        socket.on('vote', (data) => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === data.id) {
                    nodes[i].votes  += data.stake;
                    break;
                }
            }
            serverIO.emit('nodeList', {'list': nodes});
            votes++;
            if (votes === nodes.length) {
                console.log('ok');
                selectDelegates();
            }
        });

        socket.on('task', (data) => {
           console.log(data.task);
           process.push(data.task);
           nodeIO.emit('newProcess', {'task': data.task});
           serverIO.emit('newProcess', {'task': data.task});
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === socket.id) {
                    nodes[i].stake+=1;
                    break;
                }
            }
        });

        socket.on('name', data => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === socket.id) {
                    nodes[i].name = data.name;
                    nodeIO.to(nodes[i].id).emit('nodeInfo', {'node': nodes[i]});
                    break;
                }
            }
            serverIO.emit('nodeList', {'list': nodes});
        });
    });

    function selectDelegates() {
        votes = 0;
        sortNodes();
        if (nodes[delegatedNum-1].votes >= (totalStakes*nodePercent)) {
            nodeIO.emit('votationEnd');
            console.log('Exito');
            sendNodesInfo();
            notifyDelegated();
            serverIO.emit('votationEnd', {'nodes': nodes});
        } else {
            console.log('Repetir');
            nodeIO.emit('startVotation', {'list': nodes});
        }
    }

    function sendNodesInfo() {
        nodes.forEach(node => {
            nodeIO.to(node.id).emit('nodeInfo', {'node': node});
        })
    }

    function resetVotes() {
        nodes.forEach(node => {
            node.votes = 0;
            node.isDelegated = false;
        });
    }

    function notifyDelegated() {
        for (let i = 0; i < delegatedNum; i++) {
            nodes[i].isDelegated = true;
            console.log(nodes[i].name);
            nodeIO.to(nodes[i].id).emit('isDelegated');
        }
    }

    function sortNodes() {
        nodes.sort(function (node1, node2) {
            return node2.votes - node1.votes;
        });
    }
    
    function calculateStakes() {
        totalStakes = 0;
        nodes.forEach(node => {
            totalStakes += node.stake;
        });
    }

    function Node(id, ip, port) {
        this.id = id;
        this.ip = ip;
        this.port = port;
        this.name = "";
        this.votes = 0;
        this.isDelegated = false;
        this.stake =  Math.floor(Math.random() * (6 - 1) + 1);
    }
};
