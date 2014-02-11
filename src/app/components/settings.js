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
      elasticsearch     : "http://"+window.location.hostname+":9200",
      panel_names       : [],
      query_factors     : [],
      kibana_index      : 'kibana-int',
      kibana_user_index : 'kibana-user',
      default_route     : '/dashboard/file/default.json',
      default_language  : 'en_US'
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
