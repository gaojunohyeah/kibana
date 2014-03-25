define([
  'angular',
  'jquery'
],
function (angular,$) {
  'use strict';

  angular
    .module('kibana.directives')
    .directive('kibanaPanel', function($compile) {
      var container = '<div class="panel-container" ng-style="{\'min-height\':row.height}"></div>';
      var content = '<div class="panel-content"></div>';

      var panelHeader =
      '<div class="panel-header">'+
        '<div class="row-fluid">' +
          '<div class="span12 alert-error panel-error" ng-hide="!panel.error">' +
            '<a class="close" ng-click="panel.error=false">&times;</a>' +
            '<i class="icon-exclamation-sign"></i> <strong>Oops!</strong> {{panel.error}}' +
          '</div>' +
        '</div>\n' +

        '<div class="row-fluid panel-extra">' +
          '<div class="panel-extra-container">' +

            '<span class="extra row-button" ng-show="panel.editable != false && panel.removable != false">' +
              '<span confirm-click="row.panels = _.without(row.panels,panel)" '+
              'confirmation="Are you sure you want to remove this {{panel.type}} panel?" class="pointer">'+
              '<i class="icon-remove pointer" bs-tooltip="\'Remove\'"></i></span>'+
            '</span>' +

            '<span class="extra row-button" ng-hide="panel.draggable == false">' +
              '<span class="pointer" bs-tooltip="\'Drag here to move\'"' +
              'data-drag=true data-jqyoui-options="kbnJqUiDraggableOptions"'+
              ' jqyoui-draggable="'+
              '{'+
                'animate:false,'+
                'mutate:false,'+
                'index:{{$index}},'+
                'onStart:\'panelMoveStart\','+
                'onStop:\'panelMoveStop\''+
                '}"  ng-model="row.panels"><i class="icon-move"></i></span>'+
            '</span>' +

            '<span class="row-button extra" ng-show="panel.editable != false">' +
              '<span config-modal="./app/partials/paneleditor.html" kbn-model="panel" class="pointer">'+
              '<i class="icon-cog pointer" bs-tooltip="\'Configure\'"></i></span>'+
            '</span>' +

            '<span ng-repeat="task in panelMeta.modals" class="row-button extra" ng-show="task.show">' +
              '<span bs-modal="task.partial" class="pointer"><i ' +
                'bs-tooltip="task.description" ng-class="task.icon" class="pointer"></i></span>'+
            '</span>' +

            '<span class="row-button extra" ng-show="panelMeta.loading == true">' +
              '<span>'+
                '<i class="icon-spinner icon-spin icon-large"></i>' +
              '</span>'+
            '</span>' +

            '<span class="panel-text panel-title">' +
              '{{panel.title?panel.title:panel.type}}' +
            '</span>'+

          '</div>'+

        //add queryFactors's input text, eg: serverID text
        '<div>' +
          '<form name="input">' +
            '<span ng-repeat="factor in queryFactors">' +
              // if factor type is input
              '<span ng-show="factor.type === \'input\'">' +
                '<strong>{{factor.name | i18n:\'base\'}}&nbsp;&nbsp;<input type="checkbox" ng-model="factor.selected">:&nbsp;&nbsp;' +
                '<input type="text" class="input-medium" ng-model="factor.value" />&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

              // if factor type is after_select and factor.list not empty
              '<span ng-show="factor.type === \'after_select\' && !_.isUndefined(factor.affectIndex)">' +
                '<strong>{{factor.name | i18n:\'base\'}}&nbsp;&nbsp;<input type="checkbox" ng-model="factor.selected">:&nbsp;&nbsp;' +
                '<select class="input-medium" ng-model="factor.value" ng-options="key as value.name for (key ,value) in factor.list" ng-change="selectFactor(factor,queryFactors)">' +
                   '<option value="" ng-show="factor.name != \'message.gameCode\'">{{\'QUERY.SELECT.DEFAULT\' | i18n:\'base\'}}</option>' +
                '</select>&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

              // if factor type is after_select and factor.list not empty
              '<span ng-show="factor.type === \'after_select\' && _.isUndefined(factor.affectIndex)">' +
              '<strong>{{factor.name | i18n:\'base\'}}&nbsp;&nbsp;<input type="checkbox" ng-model="factor.selected">:&nbsp;&nbsp;' +
              '<select class="input-medium" ng-model="factor.value" ng-options="key as value for (key, value) in factor.list" ng-change="selectFactor(factor,queryFactors)">' +
                '<option value="">{{\'QUERY.SELECT.DEFAULT\' | i18n:\'base\'}}</option>' +
              '</select>&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

              // if factor type is user_select
              '<span ng-show="factor.type === \'before_select\'">' +
                '<br><strong>{{\'PANEL.EXTRA.USER.SELECT\' | i18n:\'base\'}}&nbsp;&nbsp;<input type="checkbox" ng-model="factor.selected">:&nbsp;&nbsp;' +
                '<select class="input-medium" ng-model="factor.name" ng-options="key as value for (key, value) in factor.list">{{factor.list.message.charId}}' +
                  '<option value="">{{\'QUERY.SELECT.DEFAULT\' | i18n:\'base\'}}</option>' +
                '</select>&nbsp;&nbsp;-&nbsp;&nbsp;' +
                '<input type="text" class="input-medium" ng-model="factor.value" />&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

              // if factor has end operater and type is time
              '<span ng-show="factor.type === \'time\'">' +
                '<strong>{{\'QUERY.TIMESTAMP.AREA\' | i18n:\'base\'}}&nbsp;&nbsp;<input type="checkbox" ng-model="factor.selected" ng-click="makeFactorTime(factor,query_time)">:&nbsp;&nbsp;' +
                '<input class="timepicker-date" type="text" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.from.date" data-date-format="yyyy-mm-dd" required bs-datepicker />' +
                '@<input class="timepicker-hms" type="text" maxlength="2" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.from.hour" required ng-pattern="patterns.hour" onClick="this.select();"/>' +
                ':<input class="timepicker-hms" type="text" maxlength="2" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.from.minute" required ng-pattern="patterns.minute" onClick="this.select();"/>' +
                '&nbsp;&nbsp;{{\'PANEL.EXTRA.STRING.TO\' | i18n:\'base\'}}&nbsp;&nbsp;' +
                '<input class="timepicker-date" type="text" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.to.date" data-date-format="yyyy-mm-dd" required bs-datepicker />' +
                '@<input class="timepicker-hms" type="text" maxlength="2" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.to.hour" required ng-pattern="patterns.hour" onClick="this.select();"/>' +
                ':<input class="timepicker-hms" type="text" maxlength="2" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.to.minute" required ng-pattern="patterns.minute" onClick="this.select();"/>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

              // if factor type is query
              '<span ng-show="factor.type === \'query\'">' +
                '<strong>&nbsp;&nbsp;{{\'PANEL.EXTRA.QUERY.INFO\' | i18n:\'base\'}}&nbsp;&nbsp;:&nbsp;&nbsp;' +
                '<input type="text" ng-model="factor.value" />&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

            '</span>' +
            '<span name="query_time" ng-show="queryFactors">' +
              '<span ng-hide="query_time.query_time_isvalid"><strong><font color="red">{{\'QUERY.INVALID.DATE_RANGE\' |i18n:\'base\'}}</font></strong></span>' +
              '<button type="button" ng-click="dashboard.refresh();" ng-disabled="!query_time.query_time_isvalid" class="btn btn-success">{{\'QUERY.SUBMIT_QUERY\' |i18n:\'base\'}}</button>&nbsp;&nbsp;' +
            '</span>' +
          '</form>' +
        '</div>\n'+
      '</div>';

      return {
        restrict: 'E',
        link: function($scope, elem, attr) {
          // once we have the template, scan it for controllers and
          // load the module.js if we have any
          var newScope = $scope.$new();

          $scope.kbnJqUiDraggableOptions = {
            revert: 'invalid',
            helper: function() {
              return $('<div style="width:200px;height:100px;background: rgba(100,100,100,0.50);"/>');
            },
            placeholder: 'keep'
          };

          // compile the module and uncloack. We're done
          function loadModule($module) {
            $module.appendTo(elem);
            elem.wrap(container);
            /* jshint indent:false */
            $compile(elem.contents())(newScope);
            elem.removeClass("ng-cloak");
          }

          newScope.$on('$destroy',function(){
            elem.unbind();
            elem.remove();
          });

          $scope.$watch(attr.type, function (name) {
            elem.addClass("ng-cloak");
            // load the panels module file, then render it in the dom.
            var nameAsPath = name.replace(".", "/");
            $scope.require([
              'jquery',
              'text!panels/'+nameAsPath+'/module.html',
              'text!panels/'+nameAsPath+'/editor.html'
            ], function ($, moduleTemplate) {
              var $module = $(moduleTemplate);
              // top level controllers
              var $controllers = $module.filter('ngcontroller, [ng-controller], .ng-controller');
              // add child controllers
              $controllers = $controllers.add($module.find('ngcontroller, [ng-controller], .ng-controller'));

              if ($controllers.length) {
                $controllers.first().prepend(panelHeader);

                $controllers.first().find('.panel-header').nextAll().wrapAll(content);

                $scope.require([
                  'panels/'+nameAsPath+'/module'
                ], function() {
                  loadModule($module);
                });
              } else {
                loadModule($module);
              }
            });
          });
        }
      };
    });

});