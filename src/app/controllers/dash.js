define([
  'angular',
  'config',
  'lodash',
  'services/all'
],
function (angular, config, _) {
  "use strict";

  var module = angular.module('kibana.controllers');

  module.controller('DashCtrl', function(
    $rootScope, $scope, $route, ejsResource, fields, dashboard, alertSrv, panelMove, esVersion, kbnVersion) {

    $scope.Math = Math;

    $scope.editor = {
      index: 0
    };

    $scope.needSaveConfig = false;

    $scope.gameServer = {
      'add': {
        'gameCode':'',
        'regionId':'',
        'serverId':'',
        'inputId':'',
        'inputName':''
      },
      'del': {
        'gameCode':'',
        'regionId':'',
        'serverId':''
      }
    };

    // For moving stuff around the dashboard.
    $scope.panelMoveDrop = panelMove.onDrop;
    $scope.panelMoveStart = panelMove.onStart;
    $scope.panelMoveStop = panelMove.onStop;
    $scope.panelMoveOver = panelMove.onOver;
    $scope.panelMoveOut = panelMove.onOut;


    $scope.init = function() {
      $scope.config = config;
      $scope.kbnVersion = kbnVersion;
      // Make stuff, including lodash available to views
      $scope._ = _;
      $scope.dashboard = dashboard;
      $scope.dashAlerts = alertSrv;
      $scope.esVersion = esVersion;

      // Clear existing alerts
      alertSrv.clearAll();

      // Provide a global list of all seen fields
      $scope.fields = fields;
      $scope.reset_row();

      $scope.ejs = ejsResource(config.elasticsearch);
    };

    $scope.isPanel = function(obj) {
      if(!_.isNull(obj) && !_.isUndefined(obj) && !_.isUndefined(obj.type)) {
        return true;
      } else {
        return false;
      }
    };

    $scope.add_row = function(dash,row) {
      dash.rows.push(row);
    };

    $scope.reset_row = function() {
      $scope.row = {
        title: '',
        height: '150px',
        editable: true
      };
    };

    $scope.row_style = function(row) {
      return { 'min-height': row.collapse ? '5px' : row.height };
    };

    $scope.panel_path =function(type) {
      if(type) {
        return 'app/panels/'+type.replace(".","/");
      } else {
        return false;
      }
    };

    $scope.edit_path = function(type) {
      var p = $scope.panel_path(type);
      if(p) {
        return p+'/editor.html';
      } else {
        return false;
      }
    };

    $scope.pulldownTabStyle = function(i) {
      var classes = ['bgPrimary','bgSuccess','bgWarning','bgDanger','bgInverse','bgInfo'];
      i = i%classes.length;
      return classes[i];
    };

    $scope.setEditorTabs = function(panelMeta) {
      $scope.editorTabs = ['General','Panel'];
      if(!_.isUndefined(panelMeta.editorTabs)) {
        $scope.editorTabs =  _.union($scope.editorTabs,_.pluck(panelMeta.editorTabs,'title'));
      }
      return $scope.editorTabs;
    };

    // This is whoafully incomplete, but will do for now
    $scope.parse_error = function(data) {
      var _error = data.match("nested: (.*?);");
      return _.isNull(_error) ? data : _error[1];
    };

    $scope.init();

    /**
     * function addGameServer
     * add game server config
     */
    $scope.addGameServer = function(){
      $scope.needSaveConfig = false;
      var gameCode = $scope.gameServer.add.gameCode;
      var regionId = $scope.gameServer.add.regionId;
      var inputId = $scope.gameServer.add.inputId;
      var inputName = $scope.gameServer.add.inputName;

      // inputId and inputName must be input
      if (inputId.toString().length > 0 && inputName.toString().length > 0) {
        // if do not select regionId
        if (_.isUndefined(regionId) || _.isNull(regionId) || regionId.toString().length <= 0) {
          // if do not select gameCode
          if (_.isUndefined(gameCode) || _.isNull(gameCode) || gameCode.toString().length <= 0) {
            // add new gameCode config
            $scope.config.gameConfigDictionary[inputId] = {};
            $scope.config.gameConfigDictionary[inputId]['name'] = inputName;
            $scope.config.gameConfigDictionary[inputId]['message.regionId'] = {};
            $scope.config.gameServerConfigDictionary[inputId] = {};
            $scope.config.gameServerConfigDictionary[inputId]['name'] = inputName;
            $scope.config.gameServerConfigDictionary[inputId]['message.regionId'] = {};

            if(!$scope.needSaveConfig){
              $scope.needSaveConfig = true;
            }
          }
          // else (selected gameCode)
          else {
            // add new regionId config
            $scope.config.gameConfigDictionary[gameCode]['message.regionId'][inputId] = {};
            $scope.config.gameConfigDictionary[gameCode]['message.regionId'][inputId]['name'] = inputName;
            $scope.config.gameConfigDictionary[gameCode]['message.regionId'][inputId]['message.serverId'] = {};
            $scope.config.gameServerConfigDictionary[gameCode]['message.regionId'][inputId] = {};
            $scope.config.gameServerConfigDictionary[gameCode]['message.regionId'][inputId]['name'] = inputName;
            $scope.config.gameServerConfigDictionary[gameCode]['message.regionId'][inputId]['message.serverId'] = {};

            if(!$scope.needSaveConfig){
              $scope.needSaveConfig = true;
            }
          }
        }
        // else (selected gameCode, regionId)
        else {
          // add new serverId config
          $scope.config.gameConfigDictionary[gameCode]['message.regionId'][regionId]['message.serverId'][inputId] = inputName;
          $scope.config.gameServerConfigDictionary[gameCode]['message.regionId'][regionId]['message.serverId'][inputId] = inputName;

          if(!$scope.needSaveConfig){
            $scope.needSaveConfig = true;
          }
        }
      } else {

      }
    };

    /**
     * function delGameServer
     * del game server config
     */
    $scope.delGameServer = function(){
      $scope.needSaveConfig = false;
      var gameCode = $scope.gameServer.del.gameCode;
      var regionId = $scope.gameServer.del.regionId;
      var serverId = $scope.gameServer.del.serverId;

      // if do not select serverId
      if (_.isUndefined(serverId) || _.isNull(serverId) || serverId.toString().length <= 0) {
        // if do not select regionId too
        if (_.isUndefined(regionId) || _.isNull(regionId) || regionId.toString().length <= 0) {
          delete $scope.config.gameConfigDictionary[gameCode];
          delete $scope.config.gameServerConfigDictionary[gameCode];

          if(!$scope.needSaveConfig){
            $scope.needSaveConfig = true;
          }
        }
        // else (selected gameCode, regionId)
        else {
          delete $scope.config.gameConfigDictionary[gameCode]['message.regionId'][regionId];
          delete $scope.config.gameServerConfigDictionary[gameCode]['message.regionId'][regionId];

          if(!$scope.needSaveConfig){
            $scope.needSaveConfig = true;
          }
        }
      }
      // else (selected gameCode, regionId, serverId)
      else {
        delete $scope.config.gameConfigDictionary[gameCode]['message.regionId'][regionId]['message.serverId'][serverId];
        delete $scope.config.gameServerConfigDictionary[gameCode]['message.regionId'][regionId]['message.serverId'][serverId];

        if(!$scope.needSaveConfig){
          $scope.needSaveConfig = true;
        }
      }
    };
  });
});
