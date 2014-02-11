define([
    'angular',
    'lodash',
    'config'
],
function (angular, _, config) {
    'use strict';

    var module = angular.module('kibana.controllers');

    // userController controller , control the user's information and handle login and logout action
    module.controller('userController', function ($scope, $rootScope, $location, $http, $routeParams, ejsResource, alertSrv) {
        // An elasticJS client to use
        var ejs = ejsResource(config.elasticsearch);

        // user index type in ES
        var type = 'user';

        /**
         * user's login information
         * @type {{user_name: string, password: string, is_login: boolean}}
         */
        $rootScope.user = {
            user_name: "",
            password: "",
            user_type: 0,       // 0:normal user  1:admin user
            is_login: false     // false:logout status   true:login status
        };

        /**
         * login function
         */
        $scope.login = function () {
            if (!$rootScope.user.is_login) {
                // post a http request to ES server to get the needed user information.
                $http({
                    url: config.elasticsearch + "/" + config.kibana_user_index + "/" + type + "/"+$rootScope.user.user_name+'?' + new Date().getTime(),
                    method: "GET"
                }).error(function(data, status) {
                        // unable contact ES server
                        if(status === 0) {
                            alertSrv.set("ALERT.ERROR","ALERT.ES.UNABLE_CONTACT" ,'error');
                        }
                        // user not found
                        else {
                            alertSrv.set("ALERT.ERROR","ALERT.USER.NOT_FOUND",'error');
                        }
                        return false;
                    }).success(function(data) {
                        user_load(data);
                    });

            } else {
                $location.path("/dashboard/elasticsearch/"+$rootScope.user.user_name);
            }
        };

        /**
         * logout function
         */
        $scope.logout = function () {
            // if user is login status
            if ($rootScope.user.is_login) {
                // clean user's information
                user_clean();
            }

            // jump to the login page
            $location.path("/login");
        };

        $scope.elasticsearch_user_save = function(user_name,password,user_type){
            user_name = 'passport';

            var id = user_name;

            // type is user
            if(type === 'user'){
                // user_name is not undefined
                if(!_.isUndefined(user_name)){
                    id = user_name;
                }
                // tell admin that he should type in user_name
                else{
                    alertSrv.set("ALERT.ERROR","ALERT.USER.USERNAME_EMPTY",'error');
                    return;
                }

                // password is not undefined , set a default value 123456
                if(_.isUndefined(password)){
                    password = '123456';
                }

                // user_type is not undefined , set a default value 0
                if(_.isUndefined(user_type)){
                    user_type = 0;
                }

                // init a save request
                var request = ejs.Document(config.kibana_user_index,type,id).source({
                    username: user_name,
                    password: password,
                    usertype: user_type
                });

                // send the save request and get response
                request.doIndex(
                    // Success
                    function(result) {
                        return result;
                    },
                    // Failure
                    function() {
                        return false;
                    }
                ).then(
                    function(result) {
                        // save success
                        if(!_.isUndefined(result._id)) {
                            alertSrv.set("ALERT.SUCCESS","ALERT.USER.USER_SAVE_SUCCESS",'success');
                        }
                        // save error
                        else {
                            alertSrv.set("ALERT.ERROR","ALERT.USER.USER_SAVE_ERROR",'error');
                        }
                    });
            }
        }

        /**
         * if the response matches user's input
         * then place the response data to $rootScope
         * and redirect to the user's view page
         *
         * @param data  the response data from request to ES
         */
        var user_load = function(data){
            // data match
            if(data._source.password === $rootScope.user.password){
                // set the user information to $rooScope
                $rootScope.user.user_name = data._source.username;
                $rootScope.user.password = data._source.password;
                $rootScope.user.user_type = data._source.usertype;
                $rootScope.user.is_login = true;

                // redirect to the user's view page
                if(0 === $rootScope.user.user_type){
                    $location.path("/dashboard/elasticsearch/"+$rootScope.user.user_name);
                }else{
                    $location.path("/admin");
                }
            }
            // data not match
            else{
                // show user that the input password is wrong
                alertSrv.set("ALERT.ERROR","ALERT.USER.PASSWORD_ERROR",'error');
            }
        }

        /**
         * clean user's information
         */
        var user_clean = function(){
            $rootScope.user.user_name = "";
            $rootScope.user.password = "";
            $rootScope.user.user_type = 0;
            $rootScope.user.is_login = false;
        }
    });

});
