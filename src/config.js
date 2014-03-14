/** @scratch /configuration/config.js/1
 * == Configuration
 * config.js is where you will find the core Kibana configuration. This file contains parameter that
 * must be set before kibana is run for the first time.
 */
define(['settings'],
  function (Settings) {
    "use strict";

    /** @scratch /configuration/config.js/2
     * === Parameters
     */
    return new Settings({
      /** @scratch /configuration/config.js/5
       * ==== login_url
       *
       * The URL to your passport manager server's login request url.
       */
      local_url: "http://192.168.1.115:9000",

      /** @scratch /configuration/config.js/5
       * ==== login_url
       *
       * The URL to your passport manager server's login request url.
       */
      login_url: "http://192.168.1.115:9000/pmanager/login_login",

      /** @scratch /configuration/config.js/5
       * ==== cookie_user_name
       */
      cookie_user_name: "pmanager.user.user_name",

      /** @scratch /configuration/config.js/5
       * ==== cookie_expiration_time
       *
       * default is 900000ms (after 15minutes cookie expires)
       */
      cookie_expiration_time: 900000,

      /** @scratch /configuration/config.js/5
       * ==== elasticsearch
       *
       * The URL to your elasticsearch server. You almost certainly don't
       * want +http://localhost:9200+ here. Even if Kibana and Elasticsearch are on
       * the same host. By default this will attempt to reach ES at the same host you have
       * kibana installed on. You probably want to set it to the FQDN of your
       * elasticsearch host
       */
      elasticsearch: "http://passport.genchance.com:9200/",

      /** @scratch /configuration/config.js/5
       * ==== default_route
       *
       * This is the default landing page when you don't specify a dashboard to load. You can specify
       * files, scripts or saved dashboards here. For example, if you had saved a dashboard called
       * `WebLogs' to elasticsearch you might use:
       *
       * +default_route: '/dashboard/elasticsearch/WebLogs',+
       */
      default_route: '/login',//'/dashboard/file/default.json',

      /** @scratch /configuration/config.js/5
       * ==== default_language
       *
       * This is the default language used in this web application,now here you can choose Chinese or English
       * language,maybe more in the future:
       * for Chinese: zh_CN
       * for English: en_US
       *
       * +default_route: 'en_US',+
       */
      default_language: 'zh_CN',

      /** @scratch /configuration/config.js/5
       * ==== kibana-int
       *
       * The default ES index to use for storing Kibana specific object
       * such as stored dashboards
       */
      kibana_index: "kibana-int",

      /** @scratch /configuration/config.js/5
       * ==== kibana_user
       *
       * The default ES index to use for storing Kibana user object
       * such as stored user info
       */
      kibana_user_index: "kibana_user",

      /** @scratch /configuration/config.js/5
       * ==== panel_name
       *
       * An array of panel modules available. Panels will only be loaded when they are defined in the
       * dashboard, but this list is used in the "add panel" interface.
       */
      panel_names: [
        'histogram',
        'innergram',
        'map',
        'goal',
        'jointable',
        'logtable',
        'table',
        'filtering',
        'timepicker',
        'text',
        'hits',
        'column',
        'trends',
        'bettermap',
        'query',
        'terms',
        'innerterms',
        'stats',
        'sparklines'
      ],

      /**
       * @scratch /configuration/config.js/5
       * ==== Query_factors
       * query_factors object:: This object describes the extra query conditions on this panel.
       * query_factors.name::: In extra query,which the query field.
       * query_factors.value_start::: In extra query,which the value to query.
       * query_factors.operater_start::: In extra query,which the query operator.
       * query_factors.value_end::: In extra query,which the value to query.
       * query_factors.operater_end::: In extra query,which the query operator.
       * query_factors.type::: In extra query,which the type of the factor.
       *              if you just need text input for user to input this factor,you can use 'input' type in query_factors.type
       *              or you want for date input,you can use 'time' type in query_factors.type
       *
       * eg: serverid:1000   time:[100 TO 200]
       * 'serverid' and 'time'    is  query_factors.name
       * ':' and ':['             is  query_factors.operater_start
       * '1000' and '100'         is  query_factors.value_start
       * '200'                    is  query_factors.value_end
       * ']'                      is  query_factors.operater_end
       *
       * Not every factor's value_end and operater_end attributes have value.
       */
      query_factors: [
        {
          name: 'message.gameCode',
          value_start: '',
          value_end: '',
          operater_start: ':',
          operater_end: '',
          type: 'input'
        },
        {
          name: 'message.regionId',
          value_start: '',
          value_end: '',
          operater_start: ':',
          operater_end: '',
          type: 'input'
        },
        {
          name: 'message.serverId',
          value_start: '',
          value_end: '',
          operater_start: ':',
          operater_end: '',
          type: 'input'
        },
        {
          name: '',
          value_start: '',
          value_end: '',
          operater_start: ':',
          operater_end: '',
          type: 'user_select'
        },
        {
          name: 'message.timestamp',
          value_start: '',
          value_end: '',
          operater_start: ':[',
          operater_end: ']',
          type: 'time'
        },
        {
          name: '',
          value_start: '',
          value_end: '',
          operater_start: '',
          operater_end: '',
          type: 'query'
        }
      ],

      /**
       * @scratch /configuration/config.js/5
       * ==== Time_field_collection
       * time_field_collection array:: This array defined the time field names in this web.
       * Use it to do time field filter, translate timestamp into time string.
       */
      time_field_collection: [
        'timestamp',
        '@timestamp',
        'message.timestamp',
        'message.@timestamp',
        'message.logtime.time',
        'message.logTime'
      ],

      query_time: {
        from: {
          date: '',
          hour: '00',
          minute: '00',
          second: '00',
          millisecond: '000'
        },

        to: {
          date: '',
          hour: '00',
          minute: '00',
          second: '00',
          millisecond: '000'
        },

        query_time_isvalid: true
      },

      /**
       * @scratch /configuration/config.js/5
       * ==== gameCodeArray
       * gameCode array
       */
      pageTypeArray: [
        '_meta',
        '_stat',
        '_passport'
      ],

      /**
       * @scratch /configuration/config.js/5
       * ==== specialFilterDictionary
       * specialFilter dictionary
       * see userController.js -> function loadJsonConfig
       */
      specialFilterDictionary: {},

      userInfoDictionary: {
        "message.accountId": "平台userid",
        "message.accountName": "平台用户名",
        "message.charId": "游戏roleid",
        "message.charName": "游戏角色名"
      },

      gameConfigDictionary: {
//        "pokersg": {
//          "name": "天天爱打牌",
//          "message.regionId": {
//            "1": {
//              "name": "91大区",
//              "message.serverId": {
//                "1998": "1998服务器",
//                "1999": "1999服务器"
//              }
//            }
//          },
//          "message.logName": {
//            "spskill_log": {
//              "name": "SP技能日志表",
//              "message.reason": {
//
//                "301": "SP技能获得_礼包",
//                "302": "SP技能获得_其他途径获得",
//                "303": "装备sp技能",
//                "304": "卸下sp技能"
//              }
//            },
//            "weibo_log": {
//              "name": "微博日志表",
//              "message.reason": {
//
//                "1301": "微博奖励获得_微博奖励",
//                "1302": "微信"
//              }
//            },
//            "jade_log": {
//              "name": "玉石日志表",
//              "message.reason": {
//
//                "401": "充值玉石获得_人民币兑换玉石",
//                "402": "系统玉石获得_礼包",
//                "403": "系统玉石获得_初次登录",
//                "404": "系统玉石获得_开启图鉴",
//                "405": "系统玉石获得_副本奖励",
//                "406": "玉石消耗_抽包",
//                "407": "玉石消耗_购买体力",
//                "408": "玉石消耗_购买牌库上限",
//                "409": "玉石消耗_购买cost上限",
//                "410": "玉石消耗补签",
//                "411": "玉石获得_GM平台",
//                "412": "玉石消耗_复活",
//                "413": "玉石消耗_等级限购",
//                "414": "系统玉石获得_充值赠送"
//              }
//            },
//            "gift_log": {
//              "name": "礼包表",
//              "message.reason": {
//
//                "601": "礼包_获得",
//                "602": "礼包_打开",
//                "603": "礼包_删除"
//              }
//            },
//            "pay_log": {
//              "name": "支付日志表",
//              "message.reason": {
//
//                "2201": "用户白名单命中",
//                "2202": "设备黑名单命中",
//                "2203": "用户黑名单命中",
//                "2204": "校验失败",
//                "2205": "全服订单校验失败",
//                "2206": "本服订单校验失败",
//                "2207": "限次黑名单命中",
//                "2208": "支付成功",
//                "2209": "支付请求",
//                "2210": "不在线",
//                "2211": "产品不存在",
//                "2212": "金额超出上限"
//              }
//            },
//            "change_roleInfo_log": {
//              "name": "绑定账号日志",
//              "message.reason": {
//
//                "2101": "绑定账号"
//              }
//            },
//            "collect_log": {
//              "name": "图鉴日志表",
//              "message.reason": {
//
//                "1701": "开启图鉴_获得卡牌"
//              }
//            },
//            "friend_log": {
//              "name": "好友日志",
//              "message.reason": {
//
//                "701": "好友增加_同意申请",
//                "702": "好友减少_删除好友"
//              }
//            },
//            "chatroom_log": {
//              "name": "聊天室日志表",
//              "message.reason": {
//
//                "1401": "聊天室_创建",
//                "1402": "聊天室_删除"
//              }
//            },
//            "activity_point_log": {
//              "name": "副本活动点日志表",
//              "message.reason": {
//
//                "1901": "完成副本获得活动点",
//                "1902": "活动抽奖消耗",
//                "1903": "后台加减资源点"
//              }
//            },
//            "newbie_log": {
//              "name": "新手引导日志",
//              "message.reason": {
//
//                "1501": "新手引导_开启步骤",
//                "1502": "新手引导_完成步骤"
//              }
//            },
//            "player_log": {
//              "name": "角色日志表",
//              "message.reason": {
//
//                "101": "角色创建",
//                "102": "角色删除",
//                "103": "角色转移",
//                "104": "登陆",
//                "105": "登出",
//                "106": "角色创建自动起名",
//                "107": "角色创建开始",
//                "108": "角色封停",
//                "109": "角色禁言",
//                "110": "登录设备(ios)",
//                "111": "登录设备(ANDROID)",
//                "112": "登录设备信息",
//                "113": "经验",
//                "114": "升级"
//              }
//            },
//            "mission_log": {
//              "name": "任务日志",
//              "message.reason": {
//
//                "1201": "获得任务物品",
//                "1202": "完成任务"
//              }
//            },
//            "fpoint_log": {
//              "name": "好友点日志表",
//              "message.reason": {
//
//                "801": "好友点获得_初次登录",
//                "802": "好友点获得_完成副本",
//                "803": "好友点获得_提取时间积累",
//                "804": "好友点获得_其他途径获得",
//                "805": "好友点获得_礼包",
//                "806": "好友点消耗_普通抽奖",
//                "807": "好友点获得_gm",
//                "808": "好友点获得_图鉴奖励"
//              }
//            },
//            "stamina_log": {
//              "name": "体力日志",
//              "message.reason": {
//
//                "901": "体力获得_购买",
//                "902": "体力获得_libao",
//                "903": "体力获得_升级",
//                "904": "体力消耗_使用",
//                "905": "体力获得_gm",
//                "906": "体力获得_关卡结束奖励",
//                "907": "体力获得_图鉴奖励"
//              }
//            },
//            "fail_load_log": {
//              "name": "加载失败日志",
//              "message.reason": {
//
//                "2001": "客户端加载失败汇报"
//              }
//            },
//            "invite_log": {
//              "name": "邀请码好友日志",
//              "message.reason": {
//
//                "1601": "邀请好友数量增加"
//              }
//            },
//            "card_log": {
//              "name": "卡牌日志",
//              "message.reason": {
//
//                "201": "卡片获得_初次登录送普牌",
//                "202": "卡片获得_初次登录玩家选A牌",
//                "203": "卡片获得_怪物掉落",
//                "204": "卡片获得_抽奖",
//                "205": "卡片获得_进化",
//                "206": "卡片获得_礼包",
//                "207": "卡片消耗_合成材料",
//                "208": "卡片消耗_进化卡",
//                "209": "卡片消耗_进化材料",
//                "210": "卡片消耗_出售",
//                "211": "普通卡片替换",
//                "212": "A卡片替换",
//                "213": "子卡装备",
//                "214": "子卡卸下",
//                "215": "卡片经验_获得经验",
//                "216": "卡片升级",
//                "217": "卡片技能升级",
//                "218": "卡片删除_gm后台添加/删除",
//                "219": "卡牌获得_微信"
//              }
//            },
//            "ticket_log": {
//              "name": "门票日志",
//              "message.reason": {
//
//                "1001": "获得门票",
//                "1002": "消耗门票",
//                "1003": "gm添加门票",
//                "1004": "gm删除门票"
//              }
//            },
//            "gold_log": {
//              "name": "金币日志",
//              "message.reason": {
//
//                "501": "金币获得_怪物掉落",
//                "502": "金币获得_副本中随机宝箱掉落",
//                "503": "金币获得_Bet获得",
//                "504": "金币获得_初次登录",
//                "505": "金币获得_出售卡牌",
//                "506": "金币获得_系统发放",
//                "507": "金币获得_打开礼包",
//                "508": "金币消耗_卡片合成",
//                "509": "金币消耗_卡片进化",
//                "510": "金币获得_关卡结束奖励",
//                "511": "金币消耗_抽奖",
//                "512": "金币获得_图鉴奖励"
//              }
//            },
//            "monlogin_log": {
//              "name": "月登陆日志表",
//              "message.reason": {
//
//                "1801": "登录天数变化",
//                "1802": "登录奖励领取"
//              }
//            },
//            "dungeon_log": {
//              "name": "关卡日志",
//              "message.reason": {
//
//                "1101": "玩家进入副本",
//                "1102": "拉好友进入副本",
//                "1103": "玩家击败怪物",
//                "1104": "玩家触发和某怪物的战斗",
//                "1105": "玩家触发宝箱怪",
//                "1106": "完成副本",
//                "1107": "战斗失败退出副本",
//                "1108": "主动退出副本"
//              }
//            }
//          }
//        }
      }
    });
  });
