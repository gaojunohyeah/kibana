/** @scratch /panels/5
 * include::panels/innerterms.asciidoc[]
 */

/** @scratch /panels/innerterms/0
 * == innerterms
 * Status: *Stable*
 *
 * A table, bar chart or pie chart based on the results of an Elasticsearch search.
 *
 */
define([
    'angular',
    'app',
    'lodash',
    'jquery',
    'kbn'
],
function (angular, app, _, $, kbn) {
    'use strict';

    var module = angular.module('kibana.panels.innerterms', []);
    app.useModule(module);

    module.controller('innerterms', function ($scope, querySrv, dashboard, filterSrv, fields) {
        $scope.panelMeta = {
            modals: [
                {
                    description: "Inspect",
                    icon: "icon-info-sign",
                    partial: "app/partials/inspector.html",
                    show: $scope.panel.spyable
                }
            ],
            editorTabs: [
                {title: 'Queries', src: 'app/partials/querySelect.html'}
            ],
            status: "Stable",
            description: "Displays the results of an elasticsearch facet as a pie chart, bar chart, or a " +
                "table"
        };

        // Set and populate defaults
        var _d = {
            /** @scratch /panels/innerterms/5
             * === Parameters
             *
             * field:: The field on which to computer the facet
             */
            field: '_type',
            /** @scratch /panels/innerterms/5
             * exclude:: innerterms to exclude from the results
             */
            exclude: [],
            /** @scratch /panels/innerterms/5
             * missing:: Set to false to disable the display of a counter showing how much results are
             * missing the field
             */
            missing: true,
            /** @scratch /panels/innerterms/5
             * other:: Set to false to disable the display of a counter representing the aggregate of all
             * values outside of the scope of your +size+ property
             */
            other: true,
            /** @scratch /panels/innerterms/5
             * size:: Show this many innerterms
             */
            size: 10,
            style: { "font-size": '10pt'},
            /** @scratch /panels/innerterms/5
             * donut:: In pie chart mode, draw a hole in the middle of the pie to make a tasty donut.
             */
            donut: false,
            /** @scratch /panels/innerterms/5
             * tilt:: In pie chart mode, tilt the chart back to appear as more of an oval shape
             */
            tilt: false,
            /** @scratch /panels/innerterms/5
             * lables:: In pie chart mode, draw labels in the pie slices
             */
            labels: true,
            /** @scratch /panels/innerterms/5
             * arrangement:: In bar or pie mode, arrangement of the legend. horizontal or vertical
             */
            arrangement: 'horizontal',
            /** @scratch /panels/innerterms/5
             * chart:: table, bar or pie
             */
            chart: 'bar',
            /** @scratch /panels/innerterms/5
             * counter_pos:: The location of the legend in respect to the chart, above or below.
             */
            counter_pos: 'above',
            /** @scratch /panels/innerterms/5
             * spyable:: Set spyable to false to disable the inspect button
             */
            spyable: true,
            /** @scratch /panels/innerterms/5
             * ==== Queries
             * queries object:: This object describes the queries to use on this panel.
             * queries.mode::: Of the queries available, which to use. Options: +all, pinned, unpinned, selected+
             * queries.ids::: In +selected+ mode, which query ids are selected.
             */
            queries: {
                mode: 'all',
                ids: []
            },

            /**
             * @scratch /panels/innerterms/5
             * ==== QueryFactors
             * see config.query_factors
             */
            queryFactors: JSON.parse(JSON.stringify($scope.config.query_factors)),

            /** @scratch /panels/innerterms/5
             * tmode:: Facet mode: terms or terms_stats or terms_all
             */
            tmode: 'inner_terms',
            /** @scratch /panels/innerterms/5
             * innerTypeField:: Inner_terms search graph inner type field
             */
            innerTypeField: '',
            /** @scratch /panels/innerterms/5
             * innerValueField:: Inner_terms search graph inner value field
             */
            innerValueField: '',
            /** @scratch /panels/innerterms/5
             * startDate:: Inner_terms search graph start date
             */
            startDate: '',
            /** @scratch /panels/innerterms/5
             * endDate:: Inner_terms search graph end date
             */
            endDate: ''
        };

        _.defaults($scope.panel, _d);

        $scope.init = function () {
            $scope.hits = 0;

            $scope.$on('refresh', function () {
                $scope.get_data();
            });
            $scope.get_data();

        };

        $scope.get_data = function () {
            // Make sure we have everything for the request to complete
            if (dashboard.indices.length === 0) {
                return;
            }

            $scope.panelMeta.loading = true;
            var request,
                results,
                boolQuery,
                queries;

            $scope.field = _.contains(fields.list, $scope.panel.field + '.raw') ?
                $scope.panel.field + '.raw' : $scope.panel.field;

            request = $scope.ejs.Request().indices(dashboard.indices);

            $scope.panel.queries.ids = querySrv.idsByMode($scope.panel.queries);
            queries = JSON.parse(JSON.stringify(querySrv.getQueryObjs($scope.panel.queries.ids)));
            // append the queryFactors into queries
            queries = querySrv.appendQueryFactors(queries, $scope.panel.queryFactors);

            var startTime,endTime;
            if(!_.isUndefined($scope.panel.dateField) && ''!=$scope.panel.dateField){
                if(!_.isUndefined($scope.panel.startDate) && ''!=$scope.panel.startDate){
                    startTime = new Date($scope.panel.startDate).getTime();
                }else{
                    startTime = '*';
                }
                if(!_.isUndefined($scope.panel.endDate) && ''!=$scope.panel.endDate){
                    endTime = new Date($scope.panel.endDate).getTime();
                }else{
                    endTime = '*';
                }
            }


            // This could probably be changed to a BoolFilter
            boolQuery = $scope.ejs.BoolQuery();
            _.each(queries, function (q) {
                if(!_.isUndefined($scope.panel.dateField) && ''!=$scope.panel.dateField){
                    q.query += " AND " + $scope.panel.dateField + ":[" + startTime + " TO " + endTime + "]";
                }
                boolQuery = boolQuery.should(querySrv.toEjsObj(q));
            });

            if ($scope.panel.tmode === 'inner_terms') {
                request = request.query(
                        $scope.ejs.FilteredQuery(
                            boolQuery,
                            filterSrv.getBoolFilter(filterSrv.ids)
                        ))
                    .size($scope.panel.size);
            }

            // Populate the inspector panel
            $scope.inspector = angular.toJson(JSON.parse(request.toString()), true);

            results = request.doSearch();

            // Populate scope when we have results
            results.then(function (results) {
                $scope.panelMeta.loading = false;
                if ($scope.panel.tmode === 'terms') {
                    $scope.hits = results.hits.total;
                }

                $scope.results = results;

                $scope.$emit('render');
            });
        };

        $scope.build_search = function (term, negate) {
            if (_.isUndefined(term.meta)) {
                filterSrv.set({type: 'terms', field: $scope.field, value: term.label,
                    mandate: (negate ? 'mustNot' : 'must')});
            } else if (term.meta === 'missing') {
                filterSrv.set({type: 'exists', field: $scope.field,
                    mandate: (negate ? 'must' : 'mustNot')});
            } else {
                return;
            }
        };

        $scope.set_refresh = function (state) {
            $scope.refresh = state;
        };

        $scope.close_edit = function () {
            if ($scope.refresh) {
                $scope.get_data();
            }
            $scope.refresh = false;
            $scope.$emit('render');
        };

        $scope.showMeta = function (term) {
            if (_.isUndefined(term.meta)) {
                return true;
            }
            if (term.meta === 'other' && !$scope.panel.other) {
                return false;
            }
            if (term.meta === 'missing' && !$scope.panel.missing) {
                return false;
            }
            return true;
        };

    });

    module.directive('innerTermsChart', function (querySrv) {
        return {
            restrict: 'A',
            link: function (scope, elem) {

                // Receive render events
                scope.$on('render', function () {
                    render_panel();
                });

                // Re-render if the window is resized
                angular.element(window).bind('resize', function () {
                    render_panel();
                });

                function build_results() {
                    // if build nomal search results
                    if (scope.panel.tmode === 'inner_terms') {
                        build_normal_search_results();
                    }
                }

                function build_normal_search_results() {
                    var k = 0;
                    scope.data = [];
                    var search_result_data = [];
                    // loop the result hits
                    _.each(scope.results.hits.hits, function (v) {
                        var graph = v._source[scope.panel.field];
                        // loop one hit's graph
                        _.each(graph, function (g) {
                            var element = _.find(search_result_data, function (e) {
                                return e[scope.panel.innerTypeField] == g[scope.panel.innerTypeField];
                            });

                            if (!_.isUndefined(element)) {
                                element[scope.panel.innerValueField] += g[scope.panel.innerValueField];
                            } else {
                                element = JSON.parse(JSON.stringify(g));
                                search_result_data.push(element);
                            }

                        });

                    });

                    // sort the result json array
                    search_result_data = _.map(_.sortBy(search_result_data, scope.panel.innerTypeField));

                    _.each(search_result_data, function (r) {
                        scope.data.push({label: r[scope.panel.innerTypeField],
                            data: [
                                [k, r[scope.panel.innerValueField]]
                            ], actions: true});

                        k = k + 1;
                    });
                }

                // Function for rendering panel
                function render_panel() {
                    var plot, chartData;

                    build_results();

                    // IE doesn't work without this
                    elem.css({height: scope.panel.height || scope.row.height});

                    // Make a clone we can operate on.
                    chartData = _.clone(scope.data);
                    chartData = scope.panel.missing ? chartData :
                        _.without(chartData, _.findWhere(chartData, {meta: 'missing'}));
                    chartData = scope.panel.other ? chartData :
                        _.without(chartData, _.findWhere(chartData, {meta: 'other'}));

                    // Populate element.
                    require(['jquery.flot.pie'], function () {
                        // Populate element
                        try {
                            // Add plot to scope so we can build out own legend
                            if (scope.panel.chart === 'bar') {
                                plot = $.plot(elem, chartData, {
                                    legend: { show: false },
                                    series: {
                                        lines: { show: false },
                                        bars: { show: true, fill: 1, barWidth: 0.8, horizontal: false },
                                        shadowSize: 1
                                    },
                                    yaxis: { show: true, min: 0, color: "#c8c8c8" },
                                    xaxis: { show: false },
                                    grid: {
                                        borderWidth: 0,
                                        borderColor: '#eee',
                                        color: "#eee",
                                        hoverable: true,
                                        clickable: true
                                    },
                                    colors: querySrv.colors
                                });
                            }
                            if (scope.panel.chart === 'pie') {
                                var labelFormat = function (label, series) {
                                    return '<div ng-click="build_search(panel.field,\'' + label + '\')' +
                                        ' "style="font-size:8pt;text-align:center;padding:2px;color:white;">' +
                                        label + '<br/>' + Math.round(series.percent) + '%</div>';
                                };

                                plot = $.plot(elem, chartData, {
                                    legend: { show: false },
                                    series: {
                                        pie: {
                                            innerRadius: scope.panel.donut ? 0.4 : 0,
                                            tilt: scope.panel.tilt ? 0.45 : 1,
                                            radius: 1,
                                            show: true,
                                            combine: {
                                                color: '#999',
                                                label: 'The Rest'
                                            },
                                            stroke: {
                                                width: 0
                                            },
                                            label: {
                                                show: scope.panel.labels,
                                                radius: 2 / 3,
                                                formatter: labelFormat,
                                                threshold: 0.1
                                            }
                                        }
                                    },
                                    //grid: { hoverable: true, clickable: true },
                                    grid: { hoverable: true, clickable: true },
                                    colors: querySrv.colors
                                });
                            }

                            // Populate legend
                            if (elem.is(":visible")) {
                                setTimeout(function () {
                                    scope.legend = plot.getData();
                                    if (!scope.$$phase) {
                                        scope.$apply();
                                    }
                                });
                            }

                        } catch (e) {
                            elem.text(e);
                        }
                    });
                }

                elem.bind("plotclick", function (event, pos, object) {
                    if (object) {
                        scope.build_search(scope.data[object.seriesIndex]);
                    }
                });

                var $tooltip = $('<div>');
                elem.bind("plothover", function (event, pos, item) {
                    if (item) {
                        var value = scope.panel.chart === 'bar' ? item.datapoint[1] : item.datapoint[1][0][1];
                        $tooltip
                            .html(
                                kbn.query_color_dot(item.series.color, 20) + ' ' +
                                    item.series.label + " (" + value.toFixed(0) + ")"
                            )
                            .place_tt(pos.pageX, pos.pageY);
                    } else {
                        $tooltip.remove();
                    }
                });

            }
        };
    });

});
