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

        return function (text, label, type) {
          if(!_.isUndefined(label) && !_.isNull(label) && label.toString().length>0){
            var currentLanguage = $rootScope.language || 'en_US';
            if (localizedTexts[currentLanguage][label].hasOwnProperty(text)) {
              if (type === 'double') {
                return text + "：" + localizedTexts[currentLanguage][label][text];
              } else {
                return localizedTexts[currentLanguage][label][text];
              }
            }
          }
          return text;
        };
      }]);

    // time field filter
    module.filter('timeFilter', function () {
      return function (text, fieldName) {
        if (!_.isUndefined(text) && !_.isNull(text) && text.toString().length > 0) {
          // if it is a time field
          if (-1 != _.indexOf(config.time_field_collection, fieldName)) {
            var time = new Date(parseInt(text));
            if (!isNaN(time)) {
              return time.toLocaleString();
            }
          }
          return text;
        }
        return '';
      };
    });

    // special field filter
    module.filter('specialFilter', ['$rootScope', function ($rootScope) {
      return function (text, gameCode, fieldName) {
        var dic = $rootScope.config.specialFilterDictionary;
        if (!_.isUndefined(text) && !_.isNull(text) && text.toString().length > 0) {
          // if gameCode has value and exist in the dictionary
          if (!_.isUndefined(gameCode) && !_.isNull(gameCode) && gameCode.toString().length > 0) {
            if (dic.hasOwnProperty(gameCode)) {
              // do special filter
              if (dic[gameCode].hasOwnProperty(fieldName)) {
                return dic[gameCode][fieldName][text];
              }
            }
          }
          return text;
        }
        return '';
      };
    }]);

    // separate dictionary file
    angular.module('localization')
      .value('localizedTexts', {
        'zh_CN': {
          'base': {
            // field
            'type': '日志表',

            'message.gameCode': '游戏编码',
            'message.regionId': '游戏大区',
            'message.serverId': '游戏服务器',
            'message.timestamp': '时间',

            'message.logName': '日志表',
            'message.type': '日志类别',
            'message.logUid': '日志id',
            'message.logType': '日志类别',
            'message.logTime': '日志时间',
            'message.accountId': '用户Id',
            'message.accountName': '用户名',
            'message.charId': '角色Id',
            'message.charName': '角色名',
            'message.reason': 'reason原因',
            'message.rid': '关联ID',
            'message.param': '具体原因参数',

            '_stat': '统计日志库',
            '_meta': '原始日志库',
            '_passport': '平台日志库',

            // panel
            'PANEL.EXTRA.USER.SELECT': '角色信息',
            'PANEL.EXTRA.QUERY.INFO': '额外查询条件',
            'PANEL.EXTRA.STRING.TO': '至',

            // type base
            'BASE.RESET_INPUT': '重置',
            'BASE.CLICK_CHANGE_PAGE_TYPE': '点击切换日志库',

            // type alert
            'ALERT.SUCCESS': '成功',

            'ALERT.ERROR': '异常',
            'ALERT.ES.UNABLE_CONTACT': '无法连接ElasticSearch服务器,请检查连接参数并确认ES启动正常.',
            'ALERT.ES.UNABLE_LOAD_GAMESERVER': '无法找到游戏服务器信息.',
            'ALERT.ES.SAVE_GAMESERVER': '保存游戏服务器信息成功.',
            'ALERT.ES.UNABLE_SAVE_GAMESERVER': '无法保存游戏服务器信息.',
            'ALERT.CONFIG.UNABLE_LOAD': '无法加载数据字典，请联系管理员.',
            'ALERT.USER.NOT_FOUND': '无法找到该用户.请检查你的输入是否正确!',
            'ALERT.USER.USERNAME_PASSWORD_ERROR': '用户名或密码错误.请检查你的输入是否正确!',
            'ALERT.USER.USERNAME_EMPTY': '用户名不能为空!',
            'ALERT.USER.USER_SAVE_SUCCESS': '用户保存成功!',
            'ALERT.USER.USER_SAVE_ERROR': '用户保存失败!',

            // type query
            'QUERY.SUBMIT_QUERY': '查询',
            'QUERY.INVALID.DATE_RANGE': '输入时间无效',
            'QUERY.TIMESTAMP.AREA': '时间区间',
            'QUERY.SELECT.DEFAULT': '请选择',

            // type user
            'USER.USERNAME': '用户名:',
            'USER.PASSWORD': '密码:',
            'USER.LOGIN': '登录',

            'SHOW.ADD': '增加',
            'SHOW.DEL': '删除',
            'SHOW.ADD.GAMESERVER': '添加信息(id:name)',

            'TOOLTIP.GAMESERVER.CONFIG.ADD': '<font size="1">添加游戏服务器信息<br/>添加格式-> id:name' +
              '<br/>1.未选择游戏编码，为添加游戏编码' +
              '<br/>2.选择游戏编码未选择游戏大区，为添加游戏大区' +
              '<br/>3.即选择游戏编码又选择游戏大区时，为添加游戏服务器' +
              '<br/>所有修改需要保存才能生效</font>',
            'TOOLTIP.GAMESERVER.CONFIG.DEL': '<font size="1">删除游戏服务器信息' +
              '<br/>1.只选择游戏编码，为删除游戏编码(其下所有大区及服务器)' +
              '<br/>2.选择了游戏编码、游戏大区，为删除游戏大区(含其下的所有服务器)' +
              '<br/>3.选择了游戏编码、游戏大区和游戏服务器，为删除游戏服务器' +
              '<br/>所有修改需要保存才能生效</font>'
          },
          'pokersg':{
            // field
            'type': '日志表',

            'message.gameCode': '游戏编码',
            'message.regionId': '游戏大区',
            'message.serverId': '游戏服务器',
            'message.timestamp': '时间',

            'message.logName': '日志表',
            'message.type': '日志类别',
            'message.logUid': '日志id',
            'message.logType': '日志类别',
            'message.logTime': '日志时间',
            'message.accountId': '用户Id',
            'message.accountName': '用户名',
            'message.charId': '角色Id',
            'message.charName': '角色名',
            'message.reason': 'reason原因',
            'message.rid': '关联ID',
            'message.param': '具体原因参数',

            'message.deviceId': '设备id',
            'message.deviceType': '设备类型',
            'message.deviceConnectType': '网络环境',
            'message.deviceVersion': '操作系统版本',
            'message.cardId': '卡牌id',
            'message.cardName': '角色卡名称',
            'message.cardLevel': '卡牌等级',
            'message.cardExperience': '卡牌经验值',
            'message.position': '位置',
            'message.cardQuality': '卡片品质',
            'message.cardType': '卡片类型',
            'message.blessCardType': '抽卡类型(非抽卡-1)',
            'message.spskillId': '装备卡ID',
            'message.current': '当前玉石',
            'message.useJade': '玉石变化值',
            'message.jadetype': '玉石type',
            'message.playerGold': '玩家金币',
            'message.gainGold': '获得金币',
            'message.friendSl': '好友数量',
            'message.friendID': '好友ID',
            'message.friendName': '好友名称',
            'message.friendDl': '好友最近登陆日期',
            'message.playFpoint': '玩家好友点',
            'message.gainFpoint': '好友点变化',
            'message.count': '数量',
            'message.changeCount': '变化数量',
            'message.dungeonId': '关卡ID',
            'message.missionId': '任务ID',
            'message.wbType': '微博类型',
            'message.num': '微博奖励',
            'message.inviter': '邀请人ID',
            'message.inviterCount': '邀请人当前邀请数量',
            'message.loginDay': '本月登录天数',
            'message.giftId': '礼包id',
            'message.orderId': '订单Id',
            'message.productId': '产品Id',
            'message.startId': '支付流水Id',
            'message.notificationId': '支付响应Id',

            'message.day_ACU': '平均同时在线玩家人数',
            'message.day_PCU': '最高同时在线玩家人数',
            'message.day_RU': '日注册用户数',
            'message.day_UV': '日用户在线数',
            'message.lv_user_graph': '用户等级-用户数量graph',
            'message.CCU_graph': '不同时间段-在线人数graph',

            'message.newLongin': '新登用户数',
            'message.users': '总用户数',
            'message.uv': '登陆用户数',

            'message.newCharge': '新增付费人数',
            'message.totalRechargeStone': '兑入宝石数',
            'message.consumeRMB': '消耗RMB宝石数',
            'message.consumeMoney': '消耗系统宝石数',
            'message.totalConsumeUser': '消耗玉石用户数',
            'message.totalChargeUser': '付费用户数',
            'message.totalStone': '剩余RMB宝石',
            'message.totalgmStone': '剩余系统宝石',
            'message.arpu': '充值ARPU',

            'message.vip0': '非VIP',
            'message.vip1': 'VIP1',
            'message.vip2': 'VIP2',
            'message.vip3': 'VIP3',
            'message.vip4': 'VIP4',
            'message.vip5': 'VIP5',
            'message.vip6': 'VIP6',
            'message.vip7': 'VIP7',
            'message.vip8': 'VIP8',
            'message.vip9': 'VIP9',
            'message.vip10': 'VIP10',
            'message.totalVip': 'VIP总用户数',

            'mean': '平均值'
          }

        },
        'en_US': {
          // field
          'type': 'log table',

          'message.gameCode': 'GameCode',
          'message.regionId': 'RegionId',
          'message.serverId': 'ServerId',
          'message.timestamp': 'Timstamp',

          'message.logName': 'log table',
          'message.type': 'log type',
          'message.logUid': 'log id',
          'message.logType': 'log type',
          'message.logTime': 'log time',
          'message.accountId': 'account id',
          'message.accountName': 'account name',
          'message.charId': 'char id',
          'message.charName': 'char name',
          'message.reason': 'reason id',
          'message.rid': 'relation id',
          'message.param': 'param',

          'message.deviceId': 'device id',
          'message.deviceType': 'device type',
          'message.deviceConnectType': 'net environment',
          'message.deviceVersion': 'OS version',
          'message.cardId': 'card id',
          'message.cardName': 'card name',
          'message.cardLevel': 'card level',
          'message.cardExperience': 'card experience',
          'message.position': 'position',
          'message.cardQuality': 'card quality',
          'message.cardType': 'card type',
          'message.blessCardType': 'bless type(no bless-1)',
          'message.spskillId': 'sp skill id',
          'message.current': 'current num',
          'message.useJade': 'jade change num',
          'message.jadetype': 'jade type',
          'message.playerGold': 'user gold',
          'message.gainGold': 'gain gold',
          'message.friendSl': 'friend num',
          'message.friendID': 'friend id',
          'message.friendName': 'friend name',
          'message.friendDl': 'friend last login time',
          'message.playFpoint': 'friend point',
          'message.gainFpoint': 'friend point change',
          'message.count': 'num',
          'message.changeCount': 'change num',
          'message.dungeonId': 'dungeon id',
          'message.missionId': 'mission id',
          'message.wbType': 'weibo type',
          'message.num': 'weibo prize',
          'message.inviter': 'inviter id',
          'message.inviterCount': 'inviter invite num',
          'message.loginDay': 'login day num',
          'message.giftId': 'gift id',
          'message.orderId': 'order id',
          'message.productId': 'product id',
          'message.startId': 'start id',
          'message.notificationId': 'notification id',

          'message.day_ACU': 'Average Concurrent Users',
          'message.day_PCU': 'Peak Concurrent Users',
          'message.day_RU': 'Register Users',
          'message.day_UV': 'Users ',
          'message.lv_user_graph': 'UserLevel-userNum graph',
          'message.CCU_graph': 'Hour-userOnline graph',

          'message.newLongin': 'New Login Users Num',
          'message.users': 'Total Users Num',
          'message.uv': 'Login Users Num',

          'message.newCharge': 'New Recharge Users Num',
          'message.totalRechargeStone': 'Total Recharge Stone Num',
          'message.consumeRMB': 'Consume RMB Stone Num',
          'message.consumeMoney': 'Consume GM Stone Num',
          'message.totalConsumeUser': 'Consume Stone Users Num',
          'message.totalChargeUser': 'Recharge Users Num',
          'message.totalStone': 'Last Total RMB Stone Num',
          'message.totalgmStone': 'Last Total GM Stone Num',
          'message.arpu': 'Rcharge ARPU',

          'message.vip0': 'No VIP',
          'message.vip1': 'VIP1',
          'message.vip2': 'VIP2',
          'message.vip3': 'VIP3',
          'message.vip4': 'VIP4',
          'message.vip5': 'VIP5',
          'message.vip6': 'VIP6',
          'message.vip7': 'VIP7',
          'message.vip8': 'VIP8',
          'message.vip9': 'VIP9',
          'message.vip10': 'VIP10',
          'message.totalVip': 'Total VIP Users Num',

          'mean': 'mean',
          '_stat': 'stat log base',
          '_meta': 'meta log base',
          '_passport': 'passport log base',

          // panel
          'PANEL.EXTRA.USER.SELECT': 'userinfo',
          'PANEL.EXTRA.QUERY.INFO': 'extra query',
          'PANEL.EXTRA.STRING.TO': 'TO',
          'QUERY.SELECT.DEFAULT': 'Please select',

          // type base
          'BASE.RESET_INPUT': 'Reset',
          'BASE.CLICK_CHANGE_PAGE_TYPE': 'Click to change log base',

          // type alert
          'ALERT.SUCCESS': 'Success',

          'ALERT.ERROR': 'Error',
          'ALERT.ES.UNABLE_CONTACT': 'Could not contact Elasticsearch. Please ensure that Elasticsearch is running and your config is correct.',
          'ALERT.ES.UNABLE_LOAD_GAMESERVER': 'Could not find gameserver config.',
          'ALERT.ES.SAVE_GAMESERVER': 'Save gameserver config success.',
          'ALERT.ES.UNABLE_SAVE_GAMESERVER': 'Could not save gameserver config.',
          'ALERT.CONFIG.UNABLE_LOAD': 'Could not load config dictionary. Please contact the administrator.',
          'ALERT.USER.NOT_FOUND': 'Could not find this user. Please ensure your input correctly!',
          'ALERT.USER.USERNAME_PASSWORD_ERROR': 'Your username or password is wrong.Please ensure your input correctly!',
          'ALERT.USER.USERNAME_EMPTY': 'UserName must input',
          'ALERT.USER.USER_SAVE_SUCCESS': 'User Info save succeeded',
          'ALERT.USER.USER_SAVE_ERROR': 'User Info save failed',

          // type query
          'QUERY.SUBMIT_QUERY': 'Query',
          'QUERY.INVALID.DATE_RANGE': 'Invalid date or range',
          'QUERY.TIMESTAMP.AREA': 'time',

          // type user
          'USER.USERNAME': 'username:',
          'USER.PASSWORD': 'password:',
          'USER.LOGIN': 'Login',

          'SHOW.ADD': 'Add',
          'SHOW.DEL': 'Del',
          'SHOW.ADD.GAMESERVER': 'add info(id:name)',

          'TOOLTIP.GAMESERVER.CONFIG.ADD': '',
          'TOOLTIP.GAMESERVER.CONFIG.DEL': ''
        }
      });

  });
