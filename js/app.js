var app = angular.module('myApp', ['ngRoute']);
app.factory("services", ['$http', function($http){

	var base = 'http://frankmendez.xyz/scratch/api.php?action='

	var obj = {};

	obj.getUsers = function (){
		return $http.get(base + 'get_list');
	}

	obj.getUser = function (userID){
		return $http.get(base + 'get_user&id=' + userID);
	}

	obj.createUser = function (user){

		return $http({
		    method: 'POST',
		    url: base + 'insert_user',
		    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		    transformRequest: function(user) {
		        var str = [];
		        for(var p in user)
		        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(user[p]));
		        return str.join("&");
		    },
		    data: {first_name: user.first_name, last_name: user.last_name, mobile: user.mobile, address: user.address }
		}).success(function () {});

	}

	obj.updateUser = function (userID, user) {

		return $http({
		    method: 'POST',
		    url: base + 'update_user',
		    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		    transformRequest: function(user) {
		        var str = [];
		        for(var p in user)
		        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(user[p]));
		        return str.join("&");
		    },
		    data: {first_name: user.first_name, last_name: user.last_name, mobile: user.mobile, address: user.address, id: userID }
		}).success(function () {});

		/*return $http.post(base + 'update_user', {id: userID, user:user}).then(function (status){
			return status.data;
		});*/
	}

	obj.deleteUser = function (userID) {
		return $http.get(base + 'delete_user&id=' + userID);
	}

	return obj;   

}]);

app.controller('userListController', function ($scope, services){

	$scope.users = [];

	services.getUsers().then(function (response){

		$scope.users = response.data;

	});

});


app.controller('editCtrl', function ($scope, $rootScope, $location, $routeParams, services, user) {
    var userID = ($routeParams.userID) ? parseInt($routeParams.userID) : 0;
    $rootScope.title = (userID > 0) ? 'Edit user' : 'Add user';
    $scope.buttonText = (userID > 0) ? 'Update user' : 'Add New user';
      var original = user.data;

      if(userID == 0){

      	original = '';

      }

      original._id = userID;
      $scope.user = angular.copy(original);
      $scope.user._id = userID;

      $scope.isClean = function() {
        return angular.equals(original, $scope.user);
      }

      $scope.deleteuser = function(user) {
        $location.path('/');
        if(confirm("Are you sure to delete user number: "+$scope.user._id)==true)
        services.deleteUser($scope.user._id);
      };

      $scope.saveuser = function(user) {
        $location.path('/');
        if (userID <= 0) {

            services.createUser(user);
        }
        else {
            services.updateUser(userID, user);
        }
    };
});


app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        title: 'Users',
        templateUrl: 'partials/users-list.html',
        controller: 'userListController'
      })
      .when('/edit-user/:userID', {
        title: 'Edit User',
        templateUrl: 'partials/edit-user.html',
        controller: 'editCtrl',
        resolve: {
          user: function(services, $route){
            var userID = $route.current.params.userID;
            return services.getUser(userID);
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });
}]);

app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);