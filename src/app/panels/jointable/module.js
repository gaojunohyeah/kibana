/** @scratch /panels/5
 * include::panels/jointable.asciidoc[]
 */

/** @scratch /panels/jointable/0
 * == jointable
 * Status: *Stable*
 *
 * The jointable panel contains a sortable, pagable view of documents that. It can be arranged into
 * defined columns and offers several interactions, such as performing adhoc terms aggregations.
 *
 */
define([
  'angular',
  'app',
  'lodash',
  'kbn',
  'moment'
],
function (angular, app, _, kbn, moment) {
  'use strict';

  var module = angular.module('kibana.panels.jointable', []);
  app.useModule(module);

  module.controller('jointable', function($rootScope, $scope, $modal, $q, $compile, fields, querySrv, dashboard, filterSrv) {
    $scope.panelMeta = {
      modals : [
        {
          description: "Inspect",
          icon: "icon-info-sign",
          partial: "app/partials/inspector.html",
          show: $scope.panel.spyable
        }
      ],
      editorTabs : [
        {
          title:'Paging',
          src: 'app/panels/jointable/pagination.html'
        },
        {
          title:'Queries',
          src: 'app/partials/querySelect.html'
        }
      ],
      status: "Stable",
      description: "A paginated jointable of records matching your query or queries. Click on a row to "+
        "expand it and review all of the fields associated with that document. <p>"
    };

    // Set and populate defaults
    var _d = {
      /** @scratch /panels/jointable/5
       * === Parameters
       *
       * size:: The number of hits to show per page
       */
      size    : 100, // Per page
      /** @scratch /panels/jointable/5
       * pages:: The number of pages available
       */
      pages   : 5,   // Pages available
      /** @scratch /panels/jointable/5
       * offset:: The current page
       */
      offset  : 0,
      /** @scratch /panels/jointable/5
       * sort:: An array describing the sort order of the jointable. For example [`@timestamp',`desc']
       */
      sort    : ['_score','desc'],
      /** @scratch /panels/jointable/5
       * overflow:: The css overflow property. `min-height' (expand) or `auto' (scroll)
       */
      overflow: 'min-height',
      /** @scratch /panels/jointable/5
       * fields:: the fields used a columns of the jointable, in an array.
       */
      fields  : [],
      /** @scratch /panels/jointable/5
       * highlight:: The fields on which to highlight, in an array
       */
      highlight : [],
      /** @scratch /panels/jointable/5
       * sortable:: Set sortable to false to disable sorting
       */
      sortable: true,
      /** @scratch /panels/jointable/5
       * header:: Set to false to hide the jointable column names
       */
      header  : true,
      /** @scratch /panels/jointable/5
       * paging:: Set to false to hide the paging controls of the jointable
       */
      paging  : true,
      /** @scratch /panels/jointable/5
       * field_list:: Set to false to hide the list of fields. The user will be able to expand it,
       * but it will be hidden by default
       */
      field_list: true,
      /** @scratch /panels/jointable/5
       * all_fields:: Set to true to show all fields in the mapping, not just the current fields in
       * the jointable.
       */
      all_fields: false,
      /** @scratch /panels/jointable/5
       * trimFactor:: The trim factor is the length at which to truncate fields takinging into
       * consideration the number of columns in the jointable. For example, a trimFactor of 100, with 5
       * columns in the jointable, would trim each column at 20 character. The entirety of the field is
       * still available in the expanded view of the event.
       */
      trimFactor: 300,
      /** @scratch /panels/jointable/5
       * localTime:: Set to true to adjust the timeField to the browser's local time
       */
      localTime: false,
      /** @scratch /panels/jointable/5
       * timeField:: If localTime is set to true, this field will be adjusted to the browsers local time
       */
      timeField: '@timestamp',
      /** @scratch /panels/jointable/5
       * spyable:: Set to false to disable the inspect icon
       */
      spyable : true,
      /** @scratch /panels/jointable/5
       * ==== Queries
       * queries object:: This object describes the queries to use on this panel.
       * queries.mode::: Of the queries available, which to use. Options: +all, pinned, unpinned, selected+
       * queries.ids::: In +selected+ mode, which query ids are selected.
       */
      queries     : {
        mode        : 'all',
        ids         : []
      },

      /**
       * @scratch /panels/jointable/5
       * ==== Table1_type
       * table1_type:: first query's type in the indices
       */
      table1_type:'',

      /**
       * @scratch /panels/jointable/5
       * ==== Table1_query
       * Table1_query:: first query's query in the indices
       */
      table1_query:'',

      /**
       * @scratch /panels/jointable/5
       * ==== Table2_type
       * table1_type:: second query's type in the indices
       */
      table2_type:'',

      /**
       * @scratch /panels/jointable/5
       * ==== Table2_type
       * table2_query:: first query's query in the indices
       */
      table2_query:'',

      /**
       * @scratch /panels/jointable/5
       * ==== Fkey
       * fkey:: foreign key use to join the two query in the indices
       */
      fkey:'',

      style   : {'font-size': '9pt'},
      normTimes : true
    };
    _.defaults($scope.panel,_d);

    $scope.init = function () {
      $scope.columns = {};
      _.each($scope.panel.fields,function(field) {
        $scope.columns[field] = true;
      });

      $scope.Math = Math;
      $scope.identity = angular.identity;
      $scope.$on('refresh',function(){$scope.get_data();});

      $scope.fields = fields;
      $scope.get_data();
    };

    // Create a percent function for the view
    $scope.percent = kbn.to_percent;

    $scope.termsModal = function(field,chart) {
      $scope.modalField = field;
      showModal(
        '{"height":"300px","chart":"'+chart+'","field":"'+field+'"}','terms');
    };

    $scope.statsModal = function(field) {
      $scope.modalField = field;
      showModal(
        '{"field":"'+field+'"}','statistics');
    };

    var showModal = function(panel,type) {
      $scope.facetPanel = panel;
      $scope.facetType = type;

      // create a new modal. Can't reuse one modal unforunately as the directive will not
      // re-render on show.
      var panelModal = $modal({
        template: './app/panels/jointable/modal.html',
        persist: true,
        show: false,
        scope: $scope,
        keyboard: false
      });

      // and show it
      $q.when(panelModal).then(function(modalEl) {
        modalEl.modal('show');
      });
    };



    $scope.toggle_micropanel = function(field,groups) {
      var docs = _.map($scope.data,function(_d){return _d.kibana._source;});
      var topFieldValues = kbn.top_field_values(docs,field,10,groups);
      $scope.micropanel = {
        field: field,
        grouped: groups,
        values : topFieldValues.counts,
        hasArrays : topFieldValues.hasArrays,
        related : kbn.get_related_fields(docs,field),
        limit: 10,
        count: _.countBy(docs,function(doc){return _.contains(_.keys(doc),field);})['true']
      };
    };

    $scope.micropanelColor = function(index) {
      var _c = ['bar-success','bar-warning','bar-danger','bar-info','bar-primary'];
      return index > _c.length ? '' : _c[index];
    };

    $scope.set_sort = function(field) {
      if($scope.panel.sort[0] === field) {
        $scope.panel.sort[1] = $scope.panel.sort[1] === 'asc' ? 'desc' : 'asc';
      } else {
        $scope.panel.sort[0] = field;
      }
      $scope.get_data();
    };

    $scope.toggle_field = function(field) {
      if (_.indexOf($scope.panel.fields,field) > -1) {
        $scope.panel.fields = _.without($scope.panel.fields,field);
        delete $scope.columns[field];
      } else {
        $scope.panel.fields.push(field);
        $scope.columns[field] = true;
      }
    };

    $scope.toggle_highlight = function(field) {
      if (_.indexOf($scope.panel.highlight,field) > -1) {
        $scope.panel.highlight = _.without($scope.panel.highlight,field);
      } else {
        $scope.panel.highlight.push(field);
      }
    };

    $scope.toggle_details = function(row) {
      row.kibana.details = row.kibana.details ? false : true;
      row.kibana.view = row.kibana.view || 'json';
      //row.kibana.details = !row.kibana.details ? $scope.without_kibana(row) : false;
    };

    $scope.page = function(page) {
      $scope.panel.offset = page*$scope.panel.size;
      $scope.get_data();
    };

    $scope.build_search = function(field,value,negate) {
      var query;
      // This needs to be abstracted somewhere
      if(_.isArray(value)) {
        query = "(" + _.map(value,function(v){return angular.toJson(v);}).join(" AND ") + ")";
      } else if (_.isUndefined(value)) {
        query = '*';
        negate = !negate;
      } else {
        query = angular.toJson(value);
      }
      $scope.panel.offset = 0;
      filterSrv.set({type:'field',field:field,query:query,mandate:(negate ? 'mustNot':'must')});
    };

    $scope.fieldExists = function(field,mandate) {
      filterSrv.set({type:'exists',field:field,mandate:mandate});
    };

    $scope.get_data = function(segment,query_id) {
      $scope.search_first_finish = false;
      $scope.search_second_finish = false;

      var
        _segment,
        request_first,
        request_second,
        boolQuery1,
        boolQuery2,
        queries,
        sort;

      $scope.panel.error =  false;

      // Make sure we have everything for the request to complete
      if(dashboard.indices.length === 0) {
        return;
      }

      sort = [$scope.ejs.Sort($scope.panel.sort[0]).order($scope.panel.sort[1])];
      if($scope.panel.localTime) {
        sort.push($scope.ejs.Sort($scope.panel.timeField).order($scope.panel.sort[1]));
      }


      $scope.panelMeta.loading = true;

      _segment = _.isUndefined(segment) ? 0 : segment;
      $scope.segment = _segment;

      request_first = $scope.ejs.Request().indices(dashboard.indices[_segment]);
      request_second = $scope.ejs.Request().indices(dashboard.indices[_segment]);

      $scope.panel.queries.ids = querySrv.idsByMode($scope.panel.queries);

      queries = {
          alias: '',
          pin: false,
          type: 'lucene',
          enable: true,
          query: ''
      };

      boolQuery1 = $scope.ejs.BoolQuery();
      queries.query = "type:"+ $scope.panel.table1_type;
      if(!_.isUndefined($scope.panel.table1_query) && ""!=$scope.panel.table1_query){
        queries.query += " AND " + $scope.panel.table1_query;
      }
      boolQuery1 = boolQuery1.should(querySrv.toEjsObj(queries));

      boolQuery2 = $scope.ejs.BoolQuery();
      queries.query = "type:"+ $scope.panel.table2_type;
      if(!_.isUndefined($scope.panel.table2_query) && ""!=$scope.panel.table2_query){
        queries.query += " AND " + $scope.panel.table2_query;
      }
      boolQuery2 = boolQuery2.should(querySrv.toEjsObj(queries));

      request_first = request_first.query(
        $scope.ejs.FilteredQuery(
          boolQuery1,
          filterSrv.getBoolFilter(filterSrv.ids)
        ))
        .highlight(
          $scope.ejs.Highlight($scope.panel.highlight)
          .fragmentSize(2147483647) // Max size of a 32bit unsigned int
          .preTags('@start-highlight@')
          .postTags('@end-highlight@')
        )
        .size(10000)
        .sort(sort);

      request_second = request_second.query(
        $scope.ejs.FilteredQuery(
          boolQuery2,
          filterSrv.getBoolFilter(filterSrv.ids)
        ))
        .highlight(
          $scope.ejs.Highlight($scope.panel.highlight)
          .fragmentSize(2147483647) // Max size of a 32bit unsigned int
          .preTags('@start-highlight@')
          .postTags('@end-highlight@')
        )
        .size(10000)
        .sort(sort);

      $scope.populate_modal(request_first, request_second);

      // Populate scope when we have results
      request_first.doSearch().then(function(results) {

        if(_segment === 0) {
          $scope.hits_first = 0;
          $scope.data_first = [];
          $scope.current_fields_first = [];
          query_id = $scope.query_id = new Date().getTime();
        }

        // Check for error and abort if found
        if(!(_.isUndefined(results.error))) {
          $scope.panel.error = $scope.parse_error(results.error);
          return;
        }

        // Check that we're still on the same query, if not stop
        if($scope.query_id === query_id) {

          // This is exceptionally expensive, especially on events with a large number of fields
          $scope.data_first = $scope.data_first.concat(_.map(results.hits.hits, function(hit) {
            var
              _h = _.clone(hit),
              _p = _.omit(hit,'_source','sort','_score');

            // _source is kind of a lie here, never display it, only select values from it
            _h.kibana = {
              _source : _.extend(kbn.flatten_json(hit._source),_p),
              highlight : kbn.flatten_json(hit.highlight||{})
            };

            // Kind of cheating with the _.map here, but this is faster than kbn.get_all_fields
            $scope.current_fields_first = $scope.current_fields_first.concat(_.keys(_h.kibana._source));

            return _h;
          }));

          $scope.current_fields_first = _.uniq($scope.current_fields_first);
          $scope.hits_first += results.hits.total;

          // Sort the data_first
          $scope.data_first = _.sortBy($scope.data_first, function(v){
            if(!_.isUndefined(v.sort)) {
              return v.sort[0];
            } else {
              return 0;
            }
          });

          // Reverse if needed
          if($scope.panel.sort[1] === 'desc') {
            $scope.data_first.reverse();
          }

          // Keep only what we need for the set
//          $scope.data_first = $scope.data_first.slice(0,$scope.panel.size * $scope.panel.pages);

          $scope.search_first_finish = true;
          $scope.merge_data(_segment);
        } else {
          return;
        }

      });

      request_second.doSearch().then(function(results) {
        if(_segment === 0) {
          $scope.hits_second = 0;
          $scope.data_second = [];
          $scope.current_fields_second = [];
          query_id = $scope.query_id = new Date().getTime();
        }

        // Check for error and abort if found
        if(!(_.isUndefined(results.error))) {
          $scope.panel.error = $scope.parse_error(results.error);
          return;
        }

        // Check that we're still on the same query, if not stop
        if($scope.query_id === query_id) {

          // This is exceptionally expensive, especially on events with a large number of fields
          $scope.data_second = $scope.data_second.concat(_.map(results.hits.hits, function(hit) {
            var
              _h = _.clone(hit),
              _p = _.omit(hit,'_source','sort','_score');

            // _source is kind of a lie here, never display it, only select values from it
            _h.kibana = {
              _source : _.extend(kbn.flatten_json(hit._source),_p),
              highlight : kbn.flatten_json(hit.highlight||{})
            };

            // Kind of cheating with the _.map here, but this is faster than kbn.get_all_fields
            $scope.current_fields_second = $scope.current_fields_second.concat(_.keys(_h.kibana._source));

            return _h;
          }));

          $scope.current_fields_second = _.uniq($scope.current_fields_second);
          $scope.hits_second += results.hits.total;

          // Sort the data_second
          $scope.data_second = _.sortBy($scope.data_second, function(v){
            if(!_.isUndefined(v.sort)) {
              return v.sort[0];
            } else {
              return 0;
            }
          });

          // Reverse if needed
          if($scope.panel.sort[1] === 'desc') {
            $scope.data_second.reverse();
          }

          // Keep only what we need for the set
//          $scope.data_second = $scope.data_second.slice(0,$scope.panel.size * $scope.panel.pages);

          $scope.search_second_finish = true;
          $scope.merge_data(_segment);
        } else {
          return;
        }

      });
    };

    $scope.merge_data = function(_segment){

      if($scope.search_first_finish && $scope.search_second_finish){
        $scope.panelMeta.loading = false;

        $scope.hits = 0;
        $scope.data = [];
        $scope.current_fields = [];

        // loop the first query results
        _.each($scope.data_first, function(firstObject){
          // loop the second query results
          _.each($scope.data_second, function(secondObject){
            if(firstObject._source[$scope.panel.fkey] === secondObject._source[$scope.panel.fkey]){
              var res_object = JSON.parse(JSON.stringify(firstObject));

              for(var attr in secondObject._source){
                res_object.kibana._source[attr] = secondObject._source[attr];
                res_object._source[attr] = secondObject._source[attr];
              }

              $scope.data.push(res_object);
            }
          });
        });

        // get the finally total hits
        $scope.hits = $scope.data.length;

        // merge keys into the current_fields field
        $scope.current_fields = $scope.current_fields.concat($scope.current_fields_first);
        $scope.current_fields = $scope.current_fields.concat($scope.current_fields_second);
        $scope.current_fields = _.uniq($scope.current_fields);
        // If we're not sorting in reverse chrono order, query every index for
        // size*pages results
        // Otherwise, only get size*pages results then stop querying
        if (($scope.data.length < $scope.panel.size*$scope.panel.pages ||
          !((_.contains(filterSrv.timeField(),$scope.panel.sort[0])) && $scope.panel.sort[1] === 'desc')) &&
          _segment+1 < dashboard.indices.length) {
          $scope.get_data(_segment+1,$scope.query_id);
        }
      }
    }

    $scope.populate_modal = function(request1,request2) {
      $scope.inspector = angular.toJson(JSON.parse(request1.toString()),true);
      $scope.inspector2 = angular.toJson(JSON.parse(request2.toString()),true);
    };

    $scope.without_kibana = function (row) {
      var _c = _.clone(row);
      delete _c.kibana;
      return _c;
    };

    $scope.set_refresh = function (state) {
      $scope.refresh = state;
    };

    $scope.close_edit = function() {
      if($scope.refresh) {
        $scope.get_data();
      }
      $scope.columns = [];
      _.each($scope.panel.fields,function(field) {
        $scope.columns[field] = true;
      });
      $scope.refresh =  false;
    };

    $scope.locate = function(obj, path) {
      path = path.split('.');
      var arrayPattern = /(.+)\[(\d+)\]/;
      for (var i = 0; i < path.length; i++) {
        var match = arrayPattern.exec(path[i]);
        if (match) {
          obj = obj[match[1]][parseInt(match[2],10)];
        } else {
          obj = obj[path[i]];
        }
      }
      return obj;
    };


  });

  // This also escapes some xml sequences
  module.filter('joinTableHighlight', function() {
    return function(text) {
      if (!_.isUndefined(text) && !_.isNull(text) && text.toString().length > 0) {
        return text.toString().
          replace(/&/g, '&amp;').
          replace(/</g, '&lt;').
          replace(/>/g, '&gt;').
          replace(/\r?\n/g, '<br/>').
          replace(/@start-highlight@/g, '<code class="highlight">').
          replace(/@end-highlight@/g, '</code>');
      }
      return '';
    };
  });

  module.filter('tableTruncate', function() {
    return function(text,length,factor) {
      if (!_.isUndefined(text) && !_.isNull(text) && text.toString().length > 0) {
        return text.length > length/factor ? text.substr(0,length/factor)+'...' : text;
      }
      return '';
    };
  });



  module.filter('tableJson', function() {
    var json;
    return function(text,prettyLevel) {
      if (!_.isUndefined(text) && !_.isNull(text) && text.toString().length > 0) {
        json = angular.toJson(text,prettyLevel > 0 ? true : false);
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if(prettyLevel > 1) {
          /* jshint maxlen: false */
          json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = 'key strong';
              } else {
                cls = '';
              }
            } else if (/true|false/.test(match)) {
              cls = 'boolean';
            } else if (/null/.test(match)) {
              cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
          });
        }
        return json;
      }
      return '';
    };
  });

  // WIP
  module.filter('tableLocalTime', function(){
    return function(text,event) {
      return moment(event.sort[1]).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    };
  });

});