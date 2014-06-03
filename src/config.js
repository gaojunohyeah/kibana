/** @scratch /configuration/config.js/1
 *
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
      local_url: "http://localhost:9000",

      /** @scratch /configuration/config.js/5
       * ==== login_url
       *
       * The URL to your passport manager server's login request url.
       */
      login_url: "http://localhost:9000/pmanager/login_login",

      /** @scratch /configuration/config.js/5
       * ==== cookie_user_name
       */
      cookie_user_name: "pmanager.user.user_name",

      /** @scratch /configuration/config.js/5
       * ==== cookie_expiration_time
       *
       * default is 900000ms (after 15minutes cookie expires)
       */
      cookie_expiration_time: 3600000,

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
      default_route: '/login',

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
        'message.logTime',
        'message.registerTimestamp',
        'message.lastLoginTimestamp',
        'message.firstRechargeTimestamp',
        'message.lastRechargeTimestamp'
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

      userInfoDictionary: {
        "message.accountId": "平台userid",
        "message.accountName": "平台用户名",
        "message.charId": "游戏roleid",
        "message.charName": "游戏角色名"
      },

      /**
       * @scratch /configuration/config.js/5
       * ==== specialFilterDictionary
       * specialFilter dictionary
       * see userController.js -> function loadJsonConfig
       */
      specialFilterDictionary: {},

      /**
       * @scratch /configuration/config.js/5
       * ==== Query_factors
       * see userController.js -> function loadJsonConfig
       */
      query_factors: {},

      /**
       * @scratch /configuration/config.js/5
       * ==== specialFilterDictionary
       * gameConfigDictionary dictionary
       * see userController.js -> function loadJsonConfig
       */
      gameConfigDictionary: {},

      /**
       * @scratch /configuration/config.js/5
       * ==== gameServerConfigDictionary
       * gameServerConfig dictionary
       * see userController.js -> function loadGameServerConfig
       */
      gameServerConfigDictionary: {
//        "pokersg": {
//          "name": "天天爱西游",
//          "message.regionId":{
//            "1": {
//              "name": "91大区",
//              "message.serverId": {
//                "1998": "1998服务器",
//                "1999": "1999服务器"
//              }
//            }
//          }
//        }
      },

      /**
       * @scratch /configuration/config.js/5
       * ==== gameServerConfigModify
       * gameServerConfig modify info
       * see userController.js -> function loadGameServerConfig
       */
      gameServerConfigModify:{},

      passportLogTypes:{
        "register": "注册",
        "login": "登陆",
        "gift": "礼包",
        "activityCode": "激活码"
      }
    });
  });
