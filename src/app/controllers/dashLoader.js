define([
  'angular',
  'lodash'
],
function (angular, _) {
  'use strict';

  var module = angular.module('kibana.controllers');

  module.controller('dashLoader', function($scope, $rootScope, $http, timer, dashboard, alertSrv, $location) {
    $scope.loader = dashboard.current.loader;

    // ng-pattern regexs
    $rootScope.patterns = {
      date: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
      hour: /^([01]?[0-9]|2[0-3])$/,
      minute: /^([0-5]?[0-9])$/,
      second: /^([0-5]?[0-9])$/,
      millisecond: /^[0-9]*$/
    };
    $rootScope.query_time_isvalid = true;
    $rootScope.query_time = {
      from : {
        date : '',
        hour : '00',
        minute : '00',
        second : '00',
        millisecond : '000'
      },

      to : {
        date : '',
        hour : '00',
        minute : '00',
        second : '00',
        millisecond : '000'
      }
    };

    $scope.init = function() {
      $scope.gist_pattern = /(^\d{5,}$)|(^[a-z0-9]{10,}$)|(gist.github.com(\/*.*)\/[a-z0-9]{5,}\/*$)/;
      $scope.gist = $scope.gist || {};
      $scope.elasticsearch = $scope.elasticsearch || {};
    };

    $scope.showDropdown = function(type) {
      if(_.isUndefined(dashboard.current.loader)) {
        return true;
      }

      var _l = dashboard.current.loader;
      if(type === 'load') {
        return (_l.load_elasticsearch || _l.load_gist || _l.load_local);
      }
      if(type === 'save') {
        return (_l.save_elasticsearch || _l.save_gist || _l.save_local || _l.save_default);
      }
      if(type === 'share') {
        return (_l.save_temp);
      }
      return false;
    };

    $scope.set_default = function() {
      if(dashboard.set_default($location.path())) {
        alertSrv.set('Home Set','This page has been set as your default Kibana dashboard','success',5000);
      } else {
        alertSrv.set('Incompatible Browser','Sorry, your browser is too old for this feature','error',5000);
      }
    };

    $scope.purge_default = function() {
      if(dashboard.purge_default()) {
        alertSrv.set('Local Default Clear','Your Kibana default dashboard has been reset to the default',
          'success',5000);
      } else {
        alertSrv.set('Incompatible Browser','Sorry, your browser is too old for this feature','error',5000);
      }
    };

    $scope.elasticsearch_save = function(type,ttl) {
      dashboard.elasticsearch_save(
        type,
        ($scope.user.user_name || dashboard.current.title),
        ($scope.loader.save_temp_ttl_enable ? ttl : false)
      ).then(
        function(result) {
        if(!_.isUndefined(result._id)) {
          alertSrv.set('Dashboard Saved','This dashboard has been saved to Elasticsearch as "' +
            result._id + '"','success',5000);
          if(type === 'temp') {
            $scope.share = dashboard.share_link(dashboard.current.title,'temp',result._id);
          }
        } else {
          alertSrv.set('Save failed','Dashboard could not be saved to Elasticsearch','error',5000);
        }
      });
    };

    $scope.elasticsearch_delete = function(id) {
      dashboard.elasticsearch_delete(id).then(
        function(result) {
          if(!_.isUndefined(result)) {
            if(result.found) {
              alertSrv.set('Dashboard Deleted',id+' has been deleted','success',5000);
              // Find the deleted dashboard in the cached list and remove it
              var toDelete = _.where($scope.elasticsearch.dashboards,{_id:id})[0];
              $scope.elasticsearch.dashboards = _.without($scope.elasticsearch.dashboards,toDelete);
            } else {
              alertSrv.set('Dashboard Not Found','Could not find '+id+' in Elasticsearch','warning',5000);
            }
          } else {
            alertSrv.set('Dashboard Not Deleted','An error occurred deleting the dashboard','error',5000);
          }
        }
      );
    };

    $scope.elasticsearch_dblist = function(query) {
      dashboard.elasticsearch_list(query,$scope.loader.load_elasticsearch_size).then(
        function(result) {
        if(!_.isUndefined(result.hits)) {
          $scope.hits = result.hits.total;
          $scope.elasticsearch.dashboards = result.hits.hits;
        }
      });
    };

    $scope.save_gist = function() {
      dashboard.save_gist($scope.gist.title).then(
        function(link) {
        if(!_.isUndefined(link)) {
          $scope.gist.last = link;
          alertSrv.set('Gist saved','You will be able to access your exported dashboard file at '+
            '<a href="'+link+'">'+link+'</a> in a moment','success');
        } else {
          alertSrv.set('Save failed','Gist could not be saved','error',5000);
        }
      });
    };

    $scope.gist_dblist = function(id) {
      dashboard.gist_list(id).then(
        function(files) {
        if(files && files.length > 0) {
          $scope.gist.files = files;
        } else {
          alertSrv.set('Gist Failed','Could not retrieve dashboard list from gist','error',5000);
        }
      });
    };

    /**
     * makeFactorTime function
     *
     * @param factor
     * @param query_time
     * @returns {boolean}
     */
    $rootScope.makeFactorTime = function(factor, query_time){
      // Assume the form is valid since we're setting it to something valid
      $rootScope.query_time_isvalid = true;

      if($rootScope.query_time_isvalid) {
        if(!_.isUndefined(query_time.from.date) && ""!=query_time.from.date){
          var startTime = new Date(query_time.from.date);

          startTime.setHours(query_time.from.hour, query_time.from.minute, query_time.from.second, query_time.from.millisecond);

          factor.value_start = startTime.getTime();

          if(isNaN(factor.value_start)){
            $rootScope.query_time_isvalid = false;
            return false;
          }
        }else{
          factor.value_start = '*';
        }

        if(!_.isUndefined(query_time.to.date) && ""!=query_time.to.date){
          var endTime = new Date(query_time.to.date);

          endTime.setHours(query_time.to.hour, query_time.to.minute, query_time.to.second, query_time.to.millisecond);

          factor.value_end = endTime.getTime();

          if(isNaN(factor.value_end)){
            $rootScope.query_time_isvalid = false;
            return false;
          }
        }else{
          factor.value_end = '*';
        }

        if("*" === factor.value_start && "*" === factor.value_end){
          factor.value_start = '';
          factor.value_end = '';
        }else if("*" != factor.value_start && "*" != factor.value_end){
          if(factor.value_start >= factor.value_end){
            $rootScope.query_time_isvalid = false;
            return false;
          }
        }
      }
    };

  });

});
