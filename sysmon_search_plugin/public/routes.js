import uiRoutes from 'ui/routes';

import hostsHTML from './templates/hosts.html';
import eventHTML from './templates/event.html';
import host_statisticHTML from './templates/host_statistic.html';
import process_listHTML from './templates/process_list.html';
import PTreeHTML from './templates/process_tree.html';
import POverviewHTML from './templates/overview.html';
import PDetailHTML from './templates/detail.html';
import alertHTML from './templates/alert.html';
import searchHTML from './templates/search.html';
import dashboardHTML from './templates/dashboard.html';

uiRoutes.enable();
uiRoutes
    .when('/', {
        template: hostsHTML,
        controller: 'hostsController',
        controllerAs: 'ctrl'
    })
    .when('/hosts', {
        template: hostsHTML,
        controller: 'hostsController',
        controllerAs: 'ctrl'
    })
    .when('/host_statistic/:hostname/:date', {
        template: host_statisticHTML,
        controller: 'host_statisticController',
        controllerAs: 'ctrl'
    })
    .when('/event/:hostname/:date', {
        template: eventHTML,
        controller: 'eventController',
        controllerAs: 'ctrl'
    })
    .when('/process_list/:hostname/:eventtype/:date/:_id', {
        template: process_listHTML,
        controller: 'process_listController',
        controllerAs: 'ctrl'
    })
    .when('/process/:hostname/:date/:guid?', {
        template: PTreeHTML,
        controller: 'processController',
        controllerAs: 'ctrl'
    })
    .when('/process_overview/:hostname/:date/:guid', {
        template: POverviewHTML,
        controller: 'process_overviewController',
        controllerAs: 'ctrl'
    })
    .when('/process_detail/:hostname/:date/:guid/:_id', {
        template: PDetailHTML,
        controller: 'process_detailController',
        controllerAs: 'ctrl'
    })
    .when('/alert', {
        template: alertHTML,
        controller: 'alertController',
        controllerAs: 'ctrl'
    })
    .when('/search', {
        template: searchHTML,
        controller: 'searchController',
        controllerAs: 'ctrl'
    })
    .when('/dashboard', {
        template: dashboardHTML,
        controller: 'dashboardController',
        controllerAs: 'ctrl'
    })

module.exports = uiRoutes
