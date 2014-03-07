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
      elasticsearch: "http://192.168.1.115:9200",

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

      query_time : {
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
        },

        query_time_isvalid : true
      },

      metaLogType:[
        'player_log',
        'card_log',
        'sp_skill_log',
        'jade_log',
        'gold_log',
        'gift_log',
        'friend_log',
        'fpoint_log',
        'stamina_log',
        'ticket_log',
        'dungeon_log',
        'mission_log',
        'weibo_log',
        'chatroom_log',
        'new_bie_log',
        'invite_log',
        'collect_log',
        'mon_login_log',
        'activity_point_log',
        'fail_load_log',
        'change_role_info_log',
        'pay_log'
      ]
    });
  });
