let berkeleyApp = angular.module('app', []);

berkeleyApp.controller('Controller', ['$http', '$scope', function ($http, $scope) {
    let urlServer = 'http://localhost:3050/server';

    $scope.nodes = [{'ip': '4567890', 'port': '5678', 'name': 'yo', 'votes': '567', 'stake': 'ertghnm'}];
    $scope.process = [1,2,3,4,5,6];

    // const socket = io.connect(urlServer, {'forceNew': true});

    // socket.on('nodeList', data => {
    //     $scope.nodes = data.list;
    //     $scope.$apply();
    //     console.log($scope.list);
    // });

    $scope.initVotation = function () {
        console.log('ok');
        $scope.initButton = true;
        // socket.emit('initiateVoting');
    };
}]);
