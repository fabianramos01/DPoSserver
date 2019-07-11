let berkeleyApp = angular.module('app', []);

berkeleyApp.controller('Controller', ['$http', '$scope', function ($http, $scope) {
    let urlServer = 'http://192.168.0.23:3050/server';

    $scope.nodes = [];
    $scope.process = [];
    $scope.activeVotation = false;

    const socket = io.connect(urlServer, {'forceNew': true});

    socket.on('nodeList', data => {
        $scope.nodes = data.list;
        $scope.$apply();
        console.log($scope.nodes);
    });

    socket.on('votationEnd', data => {
        $scope.nodes = data.nodes;
        $scope.activeVotation = false;
        $scope.initButton = false;
        $scope.$apply();
        console.log('Votación terminada');
    });

    socket.on('invalidVotation', () => {
        $scope.activeVotation = false;
        $scope.initButton = false;
        $scope.$apply();
        console.log('Votación invalida por falta de usuarios');
    });

    socket.on('newProcess', (data) => {
        console.log(data.task);
        $scope.process.push(data.task);
        $scope.$apply();
    });

    $scope.initVotation = function () {
        // Materialize.toast('votación en proceso', 3000);
        console.log('ok');
        $scope.activeVotation = true;
        $scope.initButton = true;
        socket.emit('initiateVoting');
    };
}]);
