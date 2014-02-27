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
              // if factor does not have end operater and type is input
              '<span ng-show="factor.operater_end === \'\' && factor.type === \'input\'">' +
                '<strong>{{factor.name | i18n}}&nbsp;&nbsp;:&nbsp;&nbsp;' +
                '<input type="text" class="input-small" ng-model="factor.value_start" />&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

              // if factor has end operater and type is input
              '<span ng-show="factor.operater_end != \'\' && factor.type === \'input\'">' +
                '<strong>{{factor.name | i18n}}&nbsp;&nbsp;:&nbsp;&nbsp;' +
                '<input type="text" class="input-small" ng-model="factor.value_start" />' +
                '&nbsp;&nbsp;{{\'PANEL.EXTRA.STRING.TO\' | i18n}}&nbsp;&nbsp;' +
                '<input type="text" class="input-small" ng-model="factor.value_end" />&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

              // if factor does not have end operater and type is select
              '<span ng-show="factor.operater_end === \'\' && factor.type === \'user_select\'">' +
                '<strong>{{\'PANEL.EXTRA.USER.SELECT\' | i18n}}&nbsp;&nbsp;:&nbsp;&nbsp;' +
                '<select class="input-small" ng-model="factor.name" ng-options="f for f in [\'account_id\',\'account_name\',\'char_id\',\'char_name\']"></select>' +
                '&nbsp;&nbsp;:&nbsp;&nbsp;' +
                '<input type="text" class="input-small" ng-model="factor.value_start" />&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

              // if factor has end operater and type is time
              '<span ng-show="factor.operater_end != \'\' && factor.type === \'time\'">' +
                '<br><strong>{{\'QUERY.TIMESTAMP.AREA\' | i18n}}&nbsp;&nbsp;:&nbsp;&nbsp;' +
                '<input type="text" class="input-small" ng-model="factor.name" />' +
                '&nbsp;&nbsp;:&nbsp;&nbsp;' +
                '<input class="timepicker-date" type="text" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.from.date" data-date-format="yyyy-mm-dd" required bs-datepicker />@' +
                '<input class="timepicker-hms" type="text" maxlength="2" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.from.hour" required ng-pattern="patterns.hour" onClick="this.select();"/>:' +
                '<input class="timepicker-hms" type="text" maxlength="2" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.from.minute" required ng-pattern="patterns.minute" onClick="this.select();"/>:' +
                '<input class="timepicker-hms" type="text" maxlength="2" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.from.second" required ng-pattern="patterns.second" onClick="this.select();"/>.' +
                '<input class="timepicker-ms" type="text" maxlength="3" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.from.millisecond" required ng-pattern="patterns.millisecond"  onClick="this.select();"/>' +
                '&nbsp;&nbsp;{{\'PANEL.EXTRA.STRING.TO\' | i18n}}&nbsp;&nbsp;' +
                '<input class="timepicker-date" type="text" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.to.date" data-date-format="yyyy-mm-dd" required bs-datepicker />@' +
                '<input class="timepicker-hms" type="text" maxlength="2" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.to.hour" required ng-pattern="patterns.hour" onClick="this.select();"/>:' +
                '<input class="timepicker-hms" type="text" maxlength="2" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.to.minute" required ng-pattern="patterns.minute" onClick="this.select();"/>:' +
                '<input class="timepicker-hms" type="text" maxlength="2" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.to.second" required ng-pattern="patterns.second" onClick="this.select();"/>.' +
                '<input class="timepicker-ms" type="text" maxlength="3" ng-change="makeFactorTime(factor,query_time)" ng-model="query_time.to.millisecond" required ng-pattern="patterns.millisecond"  onClick="this.select();"/>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

              // if factor does not have end operater and type is query
              '<span ng-show="factor.operater_end === \'\' && factor.type === \'query\'">' +
                '<strong>&nbsp;&nbsp;{{\'PANEL.EXTRA.QUERY.INFO\' | i18n}}&nbsp;&nbsp;:&nbsp;&nbsp;' +
                '<input type="text" ng-model="factor.value_start" />&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
              '</span>' +

            '</span>' +
            '<span name="query_time" ng-show="queryFactors">' +
            '<span ng-hide="query_time.query_time_isvalid"><strong><font color="red">{{\'QUERY.INVALID.DATE_RANGE\' |i18n}}</font></strong></span>' +
            '<button type="button" ng-click="dashboard.refresh();" ng-disabled="!query_time.query_time_isvalid" class="btn btn-success">{{\'QUERY.SUBMIT_QUERY\' |i18n}}</button>' +
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