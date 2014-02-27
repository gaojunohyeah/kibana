define([
  'angular',
  'config'
],
  function (angular, config) {
    'use strict';

    var module = angular.module('kibana.controllers');

    module.controller('i18nController', function ($rootScope) {
      // default language setting
      $rootScope.language = config.default_language;

      // changeLanguage function , use to switch current wep application's language
      $rootScope.changeLang = function () {
        if ($rootScope.language === "en_US") {
          $rootScope.language = "zh_CN";
        } else {
          $rootScope.language = "en_US";
        }
      };
    });

    // i18n filter
    angular.module('localization', [])
      .filter('i18n', ['localizedTexts', '$rootScope', function (localizedTexts, $rootScope) {
        // default language setting
        $rootScope.language = config.default_language;

        return function (text, type, params) {
          var currentLanguage = $rootScope.language || 'en_US';
          if (localizedTexts[currentLanguage].hasOwnProperty(text)) {
            if(type === 'double'){
              return text+"："+localizedTexts[currentLanguage][text];
            }else{
              return localizedTexts[currentLanguage][text];
            }
          }
          return text;
        };
      }]);

    // time field filter
    module.filter('timeFilter', function() {
      return function(text,fieldName) {
        if (!_.isUndefined(text) && !_.isNull(text) && text.toString().length > 0) {
          //if it is a time field
          if(-1 != _.indexOf(config.time_field_collection, fieldName)){
            var time = new Date(text);
            if(!isNaN(time)){
              return time.toLocaleString();
            }
          }
          return text;
        }
        return '';
      };
    });

    // separate dictionary file
    angular.module('localization')
      .value('localizedTexts', {
        'zh_CN': {
          // field
          'message.gameCode' :                              '游戏编码',
          'message.regionId' :                              '游戏大区',
          'message.serverId' :                              '游戏服务器',
          'message.timestamp' :                             '时间',
          'message.day_ACU' :                               '平均同时在线玩家人数',
          'message.day_PCU' :                               '最高同时在线玩家人数',
          'message.day_RU' :                                '日注册用户数',
          'message.day_UV' :                                '日用户在线数',
          'message.lv_user_graph' :                         '用户等级-用户数量graph',
          'message.CCU_graph' :                             '不同时间段-在线人数graph',

          'message.newLongin' :                             '新登用户数',
          'message.users' :                                 '总用户数',
          'message.uv' :                                    '登陆用户数',

          'message.newCharge' :                             '新增付费人数',
          'message.totalRechargeStone' :                    '兑入宝石数',
          'message.consumeRMB' :                            '消耗RMB宝石数',
          'message.consumeMoney' :                          '消耗系统宝石数',
          'message.totalConsumeUser' :                      '消耗玉石用户数',
          'message.totalChargeUser' :                       '付费用户数',
          'message.totalStone' :                            '剩余RMB宝石',
          'message.totalgmStone' :                          '剩余系统宝石',
          'message.arpu' :                                  '充值ARPU',

          'message.vip0' :                                  '非VIP',
          'message.vip1' :                                  'VIP1',
          'message.vip2' :                                  'VIP2',
          'message.vip3' :                                  'VIP3',
          'message.vip4' :                                  'VIP4',
          'message.vip5' :                                  'VIP5',
          'message.vip6' :                                  'VIP6',
          'message.vip7' :                                  'VIP7',
          'message.vip8' :                                  'VIP8',
          'message.vip9' :                                  'VIP9',
          'message.vip10' :                                 'VIP10',
          'message.totalVip' :                              'VIP总用户数',

          'mean' :                                          '平均值',

          // panel
          'PANEL.EXTRA.USER.SELECT' :                       '角色信息',
          'PANEL.EXTRA.QUERY.INFO' :                        '额外查询条件',
          'PANEL.EXTRA.STRING.TO' :                         '至',

          // type base
          'BASE.RESET_INPUT':                               '重置',

          // type alert
          'ALERT.SUCCESS':                                  '成功',

          'ALERT.ERROR':                                    '异常',
          'ALERT.ES.UNABLE_CONTACT':                        '无法连接ElasticSearch服务器,请检查连接参数并确认ES启动正常.',
          'ALERT.USER.NOT_FOUND':                           '无法找到该用户.请检查你的输入是否正确!',
          'ALERT.USER.USERNAME_PASSWORD_ERROR':             '用户名或密码错误.请检查你的输入是否正确!',
          'ALERT.USER.USERNAME_EMPTY':                      '用户名不能为空!',
          'ALERT.USER.USER_SAVE_SUCCESS':                   '用户保存成功!',
          'ALERT.USER.USER_SAVE_ERROR':                     '用户保存失败!',

          // type query
          'QUERY.SUBMIT_QUERY':                             '查询',
          'QUERY.INVALID.DATE_RANGE':                       '输入时间无效',
          'QUERY.TIMESTAMP.AREA' :                          '时间区间',

          // type user
          'USER.USERNAME':                                  '用户名:',
          'USER.PASSWORD':                                  '密码:',
          'USER.LOGIN':                                     '登录'
        },
        'en_US': {
          // field
          'message.gameCode' :                              'GameCode',
          'message.regionId' :                              'RegionId',
          'message.serverId' :                              'ServerId',
          'message.day_ACU' :                               'Average Concurrent Users',
          'message.day_PCU' :                               'Peak Concurrent Users',
          'message.day_RU' :                                'Register Users',
          'message.day_UV' :                                'Users ',
          'message.lv_user_graph' :                         'UserLevel-userNum graph',
          'message.timestamp' :                             'Timstamp',
          'message.CCU_graph' :                             'Hour-userOnline graph',

          'message.newLongin' :                             'New Login Users Num',
          'message.users' :                                 'Total Users Num',
          'message.uv' :                                    'Login Users Num',

          'message.newCharge' :                             'New Recharge Users Num',
          'message.totalRechargeStone' :                    'Total Recharge Stone Num',
          'message.consumeRMB' :                            'Consume RMB Stone Num',
          'message.consumeMoney' :                          'Consume GM Stone Num',
          'message.totalConsumeUser' :                      'Consume Stone Users Num',
          'message.totalChargeUser' :                       'Recharge Users Num',
          'message.totalStone' :                            'Last Total RMB Stone Num',
          'message.totalgmStone' :                          'Last Total GM Stone Num',
          'message.arpu' :                                  'Rcharge ARPU',

          'message.vip0' :                                  'No VIP',
          'message.vip1' :                                  'VIP1',
          'message.vip2' :                                  'VIP2',
          'message.vip3' :                                  'VIP3',
          'message.vip4' :                                  'VIP4',
          'message.vip5' :                                  'VIP5',
          'message.vip6' :                                  'VIP6',
          'message.vip7' :                                  'VIP7',
          'message.vip8' :                                  'VIP8',
          'message.vip9' :                                  'VIP9',
          'message.vip10' :                                 'VIP10',
          'message.totalVip' :                              'Total VIP Users Num',

          'mean' :                                          'mean',

          // panel
          'PANEL.EXTRA.USER.SELECT' :                       'userinfo',
          'PANEL.EXTRA.QUERY.INFO' :                        'extra query',
          'PANEL.EXTRA.STRING.TO' :                         'TO',

          // type base
          'BASE.RESET_INPUT':                               'Reset',

          // type alert
          'ALERT.SUCCESS':                                  'Success',

          'ALERT.ERROR':                                    'Error',
          'ALERT.ES.UNABLE_CONTACT':                        'Could not contact Elasticsearch. Please ensure that Elasticsearch is running and your config is correct.',
          'ALERT.USER.NOT_FOUND':                           'Could not find this user. Please ensure your input correctly!',
          'ALERT.USER.USERNAME_PASSWORD_ERROR':             'Your username or password is wrong.Please ensure your input correctly!',
          'ALERT.USER.USERNAME_EMPTY':                      'UserName must input',
          'ALERT.USER.USER_SAVE_SUCCESS':                   'User Info save succeeded',
          'ALERT.USER.USER_SAVE_ERROR':                     'User Info save failed',

          // type query
          'QUERY.SUBMIT_QUERY':                             'Query',
          'QUERY.INVALID.DATE_RANGE':                       'Invalid date or range',
          'QUERY.TIMESTAMP.AREA' :                          'time',

          // type user
          'USER.USERNAME':                                  'username:',
          'USER.PASSWORD':                                  'password:',
          'USER.LOGIN':                                     'Login'
        }
      });

  });
