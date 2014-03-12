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
            if (type === 'double') {
              return text + "：" + localizedTexts[currentLanguage][text];
            } else {
              return localizedTexts[currentLanguage][text];
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
    module.filter('specialFilter', ['specialFilterDictionary', function (specialFilterDictionary) {
      return function (text, gameCode, fieldName) {
        if (!_.isUndefined(text) && !_.isNull(text) && text.toString().length > 0) {
          // if gameCode has value and exist in the dictionary
          if (!_.isUndefined(gameCode) && !_.isNull(gameCode) && gameCode.toString().length > 0) {
            if (specialFilterDictionary.hasOwnProperty(gameCode)) {
              // do special filter
              if (specialFilterDictionary[gameCode].hasOwnProperty(fieldName)) {
                return specialFilterDictionary[gameCode][fieldName][text];
              }
            }
          }
          return text;
        }
        return '';
      };
    }]);

    module.value('specialFilterDictionary', {
      'pokersg': {
        'message.reason': {
          101: '角色创建',
          102: '角色删除',
          103: '角色转移',
          104: '登陆',
          105: '登出',
          106: '角色创建自动起名',
          107: '角色创建开始',
          108: '角色封停',
          109: '角色禁言',
          110: '登录设备(ios)',
          111: '登录设备(ANDROID)',
          112: '登录设备信息',
          113: '经验',
          114: '升级',
          201: '卡片获得_初次登录送普牌',
          202: '卡片获得_初次登录玩家选A牌',
          203: '卡片获得_怪物掉落',
          204: '卡片获得_抽奖',
          205: '卡片获得_进化',
          206: '卡片获得_礼包',
          207: '卡片消耗_合成材料',
          208: '卡片消耗_进化卡',
          209: '卡片消耗_进化材料',
          210: '卡片消耗_出售',
          211: '普通卡片替换',
          212: 'A卡片替换',
          213: '子卡装备',
          214: '子卡卸下',
          215: '卡片经验_获得经验',
          216: '卡片升级',
          217: '卡片技能升级',
          218: '卡片删除_gm后台添加/删除',
          219: '卡牌获得_微信',
          301: 'SP技能获得_礼包',
          302: 'SP技能获得_其他途径获得',
          303: '装备sp技能',
          304: '卸下sp技能',
          401: '充值玉石获得_人民币兑换玉石',
          402: '系统玉石获得_礼包',
          403: '系统玉石获得_初次登录',
          404: '系统玉石获得_开启图鉴',
          405: '系统玉石获得_副本奖励',
          406: '玉石消耗_抽包',
          407: '玉石消耗_购买体力',
          408: '玉石消耗_购买牌库上限',
          409: '玉石消耗_购买cost上限',
          410: '玉石消耗补签',
          411: '玉石获得_GM平台',
          412: '玉石消耗_复活',
          413: '玉石消耗_等级限购',
          414: '系统玉石获得_充值赠送',
          501: '金币获得_怪物掉落',
          502: '金币获得_副本中随机宝箱掉落',
          503: '金币获得_Bet获得',
          504: '金币获得_初次登录',
          505: '金币获得_出售卡牌',
          506: '金币获得_系统发放',
          507: '金币获得_打开礼包',
          508: '金币消耗_卡片合成',
          509: '金币消耗_卡片进化',
          510: '金币获得_关卡结束奖励',
          511: '金币消耗_抽奖',
          512: '金币获得_图鉴奖励',
          601: '礼包_获得',
          602: '礼包_打开',
          603: '礼包_删除',
          701: '好友增加_同意申请',
          702: '好友减少_删除好友',
          801: '好友点获得_初次登录',
          802: '好友点获得_完成副本',
          803: '好友点获得_提取时间积累',
          804: '好友点获得_其他途径获得',
          805: '好友点获得_礼包',
          806: '好友点消耗_普通抽奖',
          807: '好友点获得_gm',
          808: '好友点获得_图鉴奖励',
          901: '体力获得_购买',
          902: '体力获得_libao',
          903: '体力获得_升级',
          904: '体力消耗_使用',
          905: '体力获得_gm',
          906: '体力获得_关卡结束奖励',
          907: '体力获得_图鉴奖励',
          1001: '获得门票',
          1002: '消耗门票',
          1003: 'gm添加门票',
          1004: 'gm删除门票',
          1101: '玩家进入副本',
          1102: '拉好友进入副本',
          1103: '玩家击败怪物',
          1104: '玩家触发和某怪物的战斗',
          1105: '玩家触发宝箱怪',
          1106: '完成副本',
          1107: '战斗失败退出副本',
          1108: '主动退出副本',
          1201: '获得任务物品',
          1202: '完成任务',
          1301: '微博奖励获得_微博奖励',
          1302: '微信',
          1401: '聊天室_创建',
          1402: '聊天室_删除',
          1501: '新手引导_开启步骤',
          1502: '新手引导_完成步骤',
          1601: '邀请好友数量增加',
          1701: '开启图鉴_获得卡牌',
          1801: '登录天数变化',
          1802: '登录奖励领取',
          1901: '完成副本获得活动点',
          1902: '活动抽奖消耗',
          1903: '后台加减资源点',
          2001: '客户端加载失败汇报',
          2101: '绑定账号',
          2201: '用户白名单命中',
          2202: '设备黑名单命中',
          2203: '用户黑名单命中',
          2204: '校验失败',
          2205: '全服订单校验失败',
          2206: '本服订单校验失败',
          2207: '限次黑名单命中',
          2208: '支付成功',
          2209: '支付请求',
          2210: '不在线',
          2211: '产品不存在',
          2212: '金额超出上限'
        },
        'message.blessCardType': {
          '-1': '非抽卡',
          1: '普通抽奖',
          2: '普通十连抽',
          3: '普通材料',
          4: '宝石火',
          5: '宝石水',
          6: '宝石木',
          7: '宝石十连抽',
          8: '宝石材料',
          9: '活动火',
          10: '活动水',
          11: '活动木',
          12: '活动十连',
          400011: '夏侯惇',
          400021: '魏延',
          400031: '小乔',
          400032: '大乔'
        },
        'message.jadetype': {
          1: 'GM玉石',
          2: 'RMB玉石'
        },
        'message.cardType': {
          1: '战斗卡',
          2: '金币卡',
          3: '经验卡',
          4: '进化卡',
          5: '技能卡'
        },
        'message.logName': {
          'player_log': '角色日志表',
          'card_log': '卡牌日志',
          'spskill_log': 'SP技能日志表',
          'jade_log': '玉石日志表',
          'gold_log': '金币日志',
          'gift_log': '礼包表',
          'friend_log': '好友日志',
          'fpoint_log': '好友点日志表',
          'stamina_log': '体力日志',
          'ticket_log': '门票日志',
          'dungeon_log': '关卡日志',
          'mission_log': '任务日志',
          'weibo_log': '微博日志表',
          'chatroom_log': '聊天室日志表',
          'newbie_log': '新手引导日志',
          'invite_log': '邀请码好友日志',
          'collect_log': '图鉴日志表',
          'monlogin_log': '月登陆日志表',
          'activity_point_log': '副本活动点日志表',
          'fail_load_log': '加载失败日志',
          'change_roleInfo_log': '绑定账号日志',
          'pay_log': '支付日志表'
        },
        'type': {
          'player_log': '角色日志表',
          'card_log': '卡牌日志',
          'spskill_log': 'SP技能日志表',
          'jade_log': '玉石日志表',
          'gold_log': '金币日志',
          'gift_log': '礼包表',
          'friend_log': '好友日志',
          'fpoint_log': '好友点日志表',
          'stamina_log': '体力日志',
          'ticket_log': '门票日志',
          'dungeon_log': '关卡日志',
          'mission_log': '任务日志',
          'weibo_log': '微博日志表',
          'chatroom_log': '聊天室日志表',
          'newbie_log': '新手引导日志',
          'invite_log': '邀请码好友日志',
          'collect_log': '图鉴日志表',
          'monlogin_log': '月登陆日志表',
          'activity_point_log': '副本活动点日志表',
          'fail_load_log': '加载失败日志',
          'change_roleInfo_log': '绑定账号日志',
          'pay_log': '支付日志表'
        }
      }
    });

    // separate dictionary file
    angular.module('localization')
      .value('localizedTexts', {
        'zh_CN': {
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

          'mean': '平均值',
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
          'ALERT.USER.NOT_FOUND': '无法找到该用户.请检查你的输入是否正确!',
          'ALERT.USER.USERNAME_PASSWORD_ERROR': '用户名或密码错误.请检查你的输入是否正确!',
          'ALERT.USER.USERNAME_EMPTY': '用户名不能为空!',
          'ALERT.USER.USER_SAVE_SUCCESS': '用户保存成功!',
          'ALERT.USER.USER_SAVE_ERROR': '用户保存失败!',

          // type query
          'QUERY.SUBMIT_QUERY': '查询',
          'QUERY.INVALID.DATE_RANGE': '输入时间无效',
          'QUERY.TIMESTAMP.AREA': '时间区间',

          // type user
          'USER.USERNAME': '用户名:',
          'USER.PASSWORD': '密码:',
          'USER.LOGIN': '登录'
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

          // type base
          'BASE.RESET_INPUT': 'Reset',
          'BASE.CLICK_CHANGE_PAGE_TYPE': 'Click to change log base',

          // type alert
          'ALERT.SUCCESS': 'Success',

          'ALERT.ERROR': 'Error',
          'ALERT.ES.UNABLE_CONTACT': 'Could not contact Elasticsearch. Please ensure that Elasticsearch is running and your config is correct.',
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
          'USER.LOGIN': 'Login'
        }
      });

  });
