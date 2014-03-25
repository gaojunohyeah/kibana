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
      var needLoadConfig = true;
      $rootScope.pageType = "_stat";

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
        if ($scope.isCookieValid()) {
          var data = "true";
          user_load(data);
        }
        //cookie无效
        else {
          $rootScope.logout();
        }
      };

      /**
       * isCookieValid function
       * valid if has cookie and it is not expirate
       * valid    ：   true
       * invalid  ：   false
       *
       * @returns {boolean}
       */
      $rootScope.isCookieValid = function () {
        //获取cookie中的用户名信息
        $rootScope.user.user_name = $scope.getCookie(config.cookie_user_name);

        //cookie中用户名信息存在且不为空
        return (!_.isUndefined($rootScope.user.user_name)
          && "" != $rootScope.user.user_name);
      };

      /**
       * login function
       */
      $rootScope.login = function () {
        if (!$rootScope.user.is_login) {
          // post a http request to ES server to get the needed user information.
          var url = config.login_url,
            postData = {
              "loginForm.userName": $rootScope.user.user_name,
              "loginForm.password": $rootScope.user.password,
              "loginFlag": 1,
              "isKibana": 1
            },
            transFn = function (postData) {
              return $.param(postData);
            },
            postCfg = {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
              transformRequest: transFn
            };
          $http.post(url, postData, postCfg
            ).error(function (data, status) {
              // unable contact ES server
              if (status === 0) {
                alertSrv.set("ALERT.ERROR", "ALERT.ES.UNABLE_CONTACT", 'error');
              }
              // user not found
              else {
                alertSrv.set("ALERT.ERROR", "ALERT.USER.NOT_FOUND", 'error');
              }
              return false;
            }).success(function (data) {
              user_load(data);
            });

        } else {
          $location.path("/dashboard/elasticsearch/" + $rootScope.user.user_name);
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

      $rootScope.elasticsearch_user_save = function (user_name, password, user_type) {
        user_name = 'passport';

        var id = user_name;

        // type is user
        if (type === 'user') {
          // user_name is not undefined
          if (!_.isUndefined(user_name)) {
            id = user_name;
          }
          // tell admin that he should type in user_name
          else {
            alertSrv.set("ALERT.ERROR", "ALERT.USER.USERNAME_EMPTY", 'error');
            return;
          }

          // password is not undefined , set a default value 123456
          if (_.isUndefined(password)) {
            password = '123456';
          }

          // user_type is not undefined , set a default value 0
          if (_.isUndefined(user_type)) {
            user_type = 0;
          }

          // init a save request
          var request = ejs.Document(config.kibana_user_index, type, id).source({
            username: user_name,
            password: password,
            usertype: user_type
          });

          // send the save request and get response
          request.doIndex(
            // Success
            function (result) {
              return result;
            },
            // Failure
            function () {
              return false;
            }
          ).then(
            function (result) {
              // save success
              if (!_.isUndefined(result._id)) {
                alertSrv.set("ALERT.SUCCESS", "ALERT.USER.USER_SAVE_SUCCESS", 'success');
              }
              // save error
              else {
                alertSrv.set("ALERT.ERROR", "ALERT.USER.USER_SAVE_ERROR", 'error');
              }
            });
        }
      };

      /**
       * change pageType
       * use this function to change page type
       * @param pageType
       */
      $rootScope.changePageType = function (pageType) {
        $rootScope.pageType = pageType;
        user_load("true");
      };

      /**
       * if the response matches user's input
       * then place the response data to $rootScope
       * and redirect to the user's view page
       *
       * @param data  the response data from request to ES
       */
      var user_load = function (data) {
        // data match
        if (data === "true") {
          $rootScope.user.is_login = true;

          $rootScope.setCookie(config.cookie_user_name, $rootScope.user.user_name);

          // redirect to the user's view page
          if (0 === $rootScope.user.user_type) {
            $http({
              url: config.elasticsearch + "/" + config.kibana_index + "/" + dashType + "/" + $rootScope.user.user_name + $rootScope.pageType + '?' + new Date().getTime(),
              method: "GET"
            }).error(function (data, status) {
                // unable contact ES server
                if (status === 0) {
                  alertSrv.set("ALERT.ERROR", "ALERT.ES.UNABLE_CONTACT", 'error');
                }
                // user dashboard not found
                else {
//                                alertSrv.set("ALERT.ERROR","ALERT.USER.NOT_FOUND",'error');
                  // load json config dictionary
                  loadConfig();
                  $location.path("/dashboard/file/logstash" + $rootScope.pageType + ".json");
                }
                return false;
              }).success(function () {
                // load json config dictionary
                loadConfig();
                $location.path("/dashboard/elasticsearch/" + $rootScope.user.user_name + $rootScope.pageType);
              });
          } else {
            $location.path("/admin");
          }
        }
        // data not match
        else {
          // show user that the input password is wrong
          alertSrv.set("ALERT.ERROR", "ALERT.USER.USERNAME_PASSWORD_ERROR", 'error');
        }
      };

      /**
       * function : loadConfig
       * load config info
       */
      var loadConfig = function () {
        if (needLoadConfig) {
          // load gameServerConfig from ES
          $rootScope.loadGameServerConfig();
        }
      };

      /**
       * function : loadJsonConfig
       * load json config dictionary
       */
      var loadJsonConfig = function () {
        $http({
          url: config.local_url + "/kibana/src/app/dashboards/json_dictionary.json" + '?' + new Date().getTime(),
          method: "GET"
        }).error(function () {
            // can't load config
            alertSrv.set("ALERT.ERROR", "ALERT.CONFIG.UNABLE_LOAD", 'error');
            return false;
          }).success(function (data) {
            $rootScope.config.gameConfigDictionary = data["jsonConfig"];
            var regionIdLabel = "message.regionId";

            // for loop the games
            _.forOwn(data["jsonConfig"], function (gameValue, gameKey) {

              $rootScope.config.gameConfigDictionary[gameKey] = gameValue;
              $rootScope.config.gameConfigDictionary[gameKey][regionIdLabel] = $rootScope.config.gameServerConfigDictionary[gameKey][regionIdLabel];

              $rootScope.config.specialFilterDictionary[gameKey] = {
                "message.reason": {}
              };

              _.forOwn(gameValue["others"], function (otherValue, otherKey) {
                $rootScope.config.specialFilterDictionary[gameKey][otherKey] = otherValue;
              });

              // for loop the game log types
              _.forOwn(gameValue["type"], function (logValue) {

                _.forOwn(logValue["message.reason"], function (reasonValue, reasonKey) {
                  $rootScope.config.specialFilterDictionary[gameKey]["message.reason"][reasonKey] = reasonValue;
                });
              })
            });

            // define query_factor
            $rootScope.config.query_factors = {
              '_stat': [
                {
                  name: 'message.gameCode',
                  value: '',
                  type: 'after_select',
                  list: $rootScope.config.gameConfigDictionary,
                  affectIndex: "1",
                  selected: true
                },
                {
                  name: 'message.regionId',
                  value: '',
                  type: 'after_select',
                  list: {},
                  affectIndex: "2",
                  selected: true
                },
                {
                  name: 'message.serverId',
                  value: '',
                  type: 'after_select',
                  list: {},
                  selected: true
                },
                {
                  name: '',
                  value: '',
                  type: 'before_select',
                  list: $rootScope.config.userInfoDictionary,
                  selected: true
                },
                {
                  name: 'message.timestamp',
                  value: '',
                  type: 'time',
                  selected: true
                },
                {
                  name: '',
                  value: '',
                  type: 'query',
                  selected: true
                }
              ],
              '_meta': [
                {
                  name: 'message.gameCode',
                  value: '',
                  type: 'after_select',
                  list: $rootScope.config.gameConfigDictionary,
                  affectIndex: "1,3",
                  selected: true
                },
                {
                  name: 'message.regionId',
                  value: '',
                  type: 'after_select',
                  list: {},
                  affectIndex: "2",
                  selected: true
                },
                {
                  name: 'message.serverId',
                  value: '',
                  type: 'after_select',
                  list: {},
                  selected: true
                },
                {
                  name: 'type',
                  value: '',
                  type: 'after_select',
                  list: {},
                  affectIndex: "4",
                  selected: true
                },
                {
                  name: 'message.reason',
                  value: '',
                  type: 'after_select',
                  list: {},
                  selected: true
                },
                {
                  name: '',
                  value: '',
                  type: 'before_select',
                  list: $rootScope.config.userInfoDictionary,
                  selected: true
                },
                {
                  name: 'message.logTime',
                  value: '',
                  type: 'time',
                  selected: true
                },
                {
                  name: '',
                  value: '',
                  type: 'query',
                  selected: true
                }
              ],
              '_passport': [
                {
                  name: 'message.gameCode',
                  value: '',
                  type: 'after_select',
                  list: $rootScope.config.gameConfigDictionary,
                  affectIndex: "1,3",
                  selected: true
                },
                {
                  name: 'message.regionId',
                  value: '',
                  type: 'after_select',
                  list: {},
                  affectIndex: "2",
                  selected: true
                },
                {
                  name: 'message.serverId',
                  value: '',
                  type: 'after_select',
                  list: {},
                  selected: true
                },
                {
                  name: 'type',
                  value: '',
                  type: 'after_select',
                  list: {},
                  affectIndex: "4",
                  selected: true
                },
                {
                  name: 'message.reason',
                  value: '',
                  type: 'after_select',
                  list: {},
                  selected: true
                },
                {
                  name: '',
                  value: '',
                  type: 'before_select',
                  list: $rootScope.config.userInfoDictionary,
                  selected: true
                },
                {
                  name: 'message.logTime',
                  value: '',
                  type: 'time',
                  selected: true
                },
                {
                  name: '',
                  value: '',
                  type: 'query',
                  selected: true
                }
              ]
            };
          });
      };

      /**
       * function loadGameServerConfig
       * load gameServerConfig from ES
       */
      $rootScope.loadGameServerConfig = function () {
        $rootScope.config = config;
        $http({
          url: config.elasticsearch + "/" + config.kibana_index + "/config/game_server_config?" + new Date().getTime(),
          method: "GET"
        }).error(function (data, status) {
            // unable contact ES server
            if (status === 0) {
              alertSrv.set("ALERT.ERROR", "ALERT.ES.UNABLE_CONTACT", 'error');
            }
            // log_game_server_config not found
            else {
              alertSrv.set("ALERT.ERROR", "ALERT.ES.UNABLE_LOAD_GAMESERVER", 'error');
            }

            loadJsonConfig();
            return false;
          }).success(function (data) {
            // load log_game_server_config
            $rootScope.config.gameServerConfigDictionary = data['_source']['gameServerConfig'];

            loadJsonConfig();
          });
      };

      /**
       * function saveGameServerConfig
       * save gameServerConfig to ES
       */
      $rootScope.saveGameServerConfig = function (needSaveConfig) {
        if (needSaveConfig) {
          // Create request with id as title. Rethink this.
          var request = ejs.Document(config.kibana_index, 'config', 'game_server_config').source({
            gameServerConfig: $rootScope.config.gameServerConfigDictionary
          });

          return request.doIndex(
            // Success
            function (result) {
              if (type === 'config') {
                $location.path('/dashboard/elasticsearch/' + config.kibana_index);
              }
              alertSrv.set("ALERT.SUCCESS", "ALERT.ES.SAVE_GAMESERVER", 'success');
              return true;
            },
            // Failure
            function () {
              alertSrv.set("ALERT.ERROR", "ALERT.ES.UNABLE_SAVE_GAMESERVER", 'error');
              return false;
            }
          );
        }
      };

      /**
       * function cancelGameServerConfig
       * cancel gameServerConfig update
       */
      $rootScope.cancelGameServerConfig = function (needSaveConfig) {
          if(needSaveConfig){
            // reload the gameServerConfig
            $rootScope.loadGameServerConfig();
            return true;
          }
      };

      /**
       * clean user's information
       */
      var user_clean = function () {
        $rootScope.user.user_name = "";
        $rootScope.user.password = "";
        $rootScope.user.user_type = 0;
        $rootScope.user.is_login = false;

        $scope.removeCookie(config.cookie_user_name);
      };

      /**
       * jump to login page
       */
      $rootScope.loginPage = function () {
        $location.path("/login");
      };

      /**
       * get cookie
       * @param key       cookie's key
       * @returns {*}
       */
      $rootScope.getCookie = function (key) {
        if (document.cookie.length > 0) {
          var c_start = document.cookie.indexOf(key + "=");
          if (c_start != -1) {
            c_start = c_start + key.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1)
              c_end = document.cookie.length;

            return unescape(document.cookie.substring(c_start, c_end));
          }
        }
        return "";
      };

      /**
       * set cookie
       * @param key       cookie's key
       * @param value     cookie's value
       */
      $rootScope.setCookie = function (key, value) {
        var expirationDate = new Date().getTime() + config.cookie_expiration_time;
        var exdate = new Date(expirationDate);
        document.cookie = key + "=" + escape(value) + "; expires=" + exdate.toGMTString() + ";path=/";
      };

      /**
       * remove cookie
       * @param key       cookie's key
       */
      $rootScope.removeCookie = function (key) {
        var exdate = new Date();
        exdate.setTime(exdate.getTime() - 1);
        document.cookie = key + "=;expires=" + exdate.toGMTString() + ";path=/";
      }
    });

  });
