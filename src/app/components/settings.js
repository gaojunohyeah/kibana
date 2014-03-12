define(['lodash'],
function (_) {
  "use strict";

  return function Settings (options) {
    /**
     * To add a setting, you MUST define a default. Also,
     * THESE ARE ONLY DEFAULTS.
     * They are overridden by config.js in the root directory
     * @type {Object}
     */
    var defaults = {
      login_url                 : "http://"+window.location.hostname+":9000/pmanager/login_login",
      cookie_user_name          : "pmanager.user.user_name",
      cookie_expiration_time    : 900000,
      elasticsearch             : "http://"+window.location.hostname+":9200",
      panel_names               : [],
      query_factors             : [],
      time_field_collection     : [],
      query_time                : {},
      kibana_index              : 'kibana-int',
      kibana_user_index         : 'kibana-user',
      default_route             : '/login',
      default_language          : 'en_US',
      metaLogType               : [],
      specialFilterText         : {},
      gameCodeArray             : [],
      pageTypeArray             : []
    };

    // This initializes a new hash on purpose, to avoid adding parameters to
    // config.js without providing sane defaults
    var settings = {};
    _.each(defaults, function(value, key) {
      settings[key] = typeof options[key] !== 'undefined' ? options[key]  : defaults[key];
    });

    return settings;
  };
});
