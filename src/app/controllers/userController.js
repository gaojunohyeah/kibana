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
        var dashType = 'dashboard';

        /**
         * user's login information
         * @type {{user_name: string, password: string, is_login: boolean}}
         */
        $rootScope.user = {
            user_name: "",
            password: "",
            expiration_date: "",
            user_type: 0,       // 0:normal user  1:admin user
            is_login: false     // false:logout status   true:login status
        };

        /**
         * userInit function
         */
        $rootScope.userInit = function () {
            //cookie有效，则跳转至该用户名的kibana页面
            if($scope.isCookieValid()){
                var data = "true";
                user_load(data);
            }
            //cookie无效
            else{
                $rootScope.logout();
            }
        }

        /**
         * isCookieValid function
         * valid if has cookie and it is not expirate
         * valid    ：   true
         * invalid  ：   false
         *
         * @returns {boolean}
         */
        $rootScope.isCookieValid = function(){
            //获取cookie中的用户名信息
            $rootScope.user.user_name = $scope.getCookie(config.cookie_user_name);

            //cookie中用户名信息存在且不为空
            return (!_.isUndefined($rootScope.user.user_name)
                && "" != $rootScope.user.user_name);
        }

        /**
         * login function
         */
        $rootScope.login = function () {
            if (!$rootScope.user.is_login) {
                // post a http request to ES server to get the needed user information.
                var url = config.login_url,
                    postData = {
                        "loginForm.userName" : $rootScope.user.user_name ,
                        "loginForm.password" : $rootScope.user.password ,
                        "loginFlag" : 1,
                        "isKibana" : 1
                    },
                    transFn = function(postData) {
                        return $.param(postData);
                    },
                    postCfg = {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                        transformRequest: transFn
                    };
                $http.post(url, postData, postCfg
                    ).error(function(data, status) {
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
        $rootScope.logout = function () {
            // clean user's information
            user_clean();

            // jump to the login page
            $rootScope.loginPage();
        };

        $rootScope.elasticsearch_user_save = function(user_name,password,user_type){
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
            if(data === "true"){
                $rootScope.user.is_login = true;

                $rootScope.setCookie(config.cookie_user_name, $rootScope.user.user_name);

                // redirect to the user's view page
                if(0 === $rootScope.user.user_type){

                    $http({
                        url: config.elasticsearch + "/" + config.kibana_index + "/" + dashType + "/"+$rootScope.user.user_name+'?' + new Date().getTime(),
                        method: "GET"
                    }).error(function(data, status) {
                            // unable contact ES server
                            if(status === 0) {
                                alertSrv.set("ALERT.ERROR","ALERT.ES.UNABLE_CONTACT" ,'error');
                            }
                            // user dashboard not found
                            else {
//                                alertSrv.set("ALERT.ERROR","ALERT.USER.NOT_FOUND",'error');
                                $location.path("/dashboard/file/logstash_default.json");
                            }
                            return false;
                        }).success(function() {
                            $location.path("/dashboard/elasticsearch/"+$rootScope.user.user_name);
                        });
                }else{
                    $location.path("/admin");
                }
            }
            // data not match
            else{
                // show user that the input password is wrong
                alertSrv.set("ALERT.ERROR","ALERT.USER.USERNAME_PASSWORD_ERROR",'error');
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

            $scope.removeCookie(config.cookie_user_name);
        }

        /**
         * jump to login page
         */
        $rootScope.loginPage = function(){
            $location.path("/login");
        }

        /**
         * get cookie
         * @param key       cookie's key
         * @param key
         * @returns {*}
         */
        $rootScope.getCookie = function(key){
            if (document.cookie.length>0)
            {
                var c_start=document.cookie.indexOf(key + "=");
                if (c_start!=-1)
                {
                    c_start=c_start + key.length+1;
                    var c_end=document.cookie.indexOf(";",c_start);
                    if (c_end==-1)
                        c_end=document.cookie.length;

                    return unescape(document.cookie.substring(c_start,c_end));
                }
            }
            return "";
        }

        /**
         * set cookie
         * @param key       cookie's key
         * @param value     cookie's value
         */
        $rootScope.setCookie = function (key, value){
            var expirationDate = new Date().getTime() + config.cookie_expiration_time;
            var exdate = new Date(expirationDate);
            document.cookie= key + "=" +escape(value)+ "; expires="+exdate.toGMTString()+";path=/";
        }

        /**
         * remove cookie
         * @param key       cookie's key
         */
        $rootScope.removeCookie = function (key){
            var exdate=new Date();
            exdate.setTime(exdate.getTime() - 1);
            document.cookie= key + "=;expires="+exdate.toGMTString()+";path=/";
        }
    });

});
