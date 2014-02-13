define([
    'angular',
    'config'
],
function (angular, config) {
    'use strict';

    var module = angular.module('kibana.controllers');

    module.controller('i18nController', function($rootScope) {
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

            return function (text) {
                var currentLanguage = $rootScope.language || 'en_US';
                if (localizedTexts[currentLanguage].hasOwnProperty(text)) {
                    return localizedTexts[currentLanguage][text];
                }
                return text;
            };
        }]);

    // separate dictionary file
    angular.module('localization')
        .value('localizedTexts', {
            'zh_CN': {
                // type base
                'BASE.RESET_INPUT'                  :   '重置',

                // type alert
                'ALERT.SUCCESS'                     :   '成功',
                'ALERT.ERROR'                       :   '异常',
                'ALERT.ES.UNABLE_CONTACT'           :   '无法连接ElasticSearch服务器,请检查连接参数并确认ES启动正常.',
                'ALERT.USER.NOT_FOUND'              :   '无法找到该用户.请检查你的输入是否正确!',
                'ALERT.USER.USERNAME_PASSWORD_ERROR':   '用户名或密码错误.请检查你的输入是否正确!',
                'ALERT.USER.USERNAME_EMPTY'         :   '用户名不能为空!',
                'ALERT.USER.USER_SAVE_SUCCESS'      :   '用户保存成功!',
                'ALERT.USER.USER_SAVE_ERROR'        :   '用户保存失败!',

                // type query
                'QUERY.SUBMIT_QUERY'                :   '查询',

                // type user
                'USER.USERNAME'                     :   '用户名:',
                'USER.PASSWORD'                     :   '密码:',
                'USER.LOGIN'                        :   '登录'
            },
            'en_US': {
                // type base
                'BASE.RESET_INPUT'                  :   'Reset',

                // type alert
                'ALERT.SUCCESS'                     :   'Success',
                'ALERT.ERROR'                       :   'Error',
                'ALERT.ES.UNABLE_CONTACT'           :   'Could not contact Elasticsearch. Please ensure that Elasticsearch is running and your config is correct.',
                'ALERT.USER.NOT_FOUND'              :   'Could not find this user. Please ensure your input correctly!',
                'ALERT.USER.USERNAME_PASSWORD_ERROR':   'Your username or password is wrong.Please ensure your input correctly!',
                'ALERT.USER.USERNAME_EMPTY'         :   'UserName must input',
                'ALERT.USER.USER_SAVE_SUCCESS'      :   'User Info save succeeded',
                'ALERT.USER.USER_SAVE_ERROR'        :   'User Info save failed',

                // type query
                'QUERY.SUBMIT_QUERY'                :   'Query',

                // type user
                'USER.USERNAME'                     :   'username:',
                'USER.PASSWORD'                     :   'password:',
                'USER.LOGIN'                        :   'Login'
            }
        });

});
