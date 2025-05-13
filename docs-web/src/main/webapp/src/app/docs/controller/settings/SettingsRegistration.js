'use strict';

/**
 * Settings register request controller.
 */
angular.module('docs').controller('SettingsRegistration', function($scope, $state, Restangular, $translate, $dialog) {
  /**
   * Load pending registration requests from server.
   */
  $scope.loadData = function () {
    // Load pending registration requests
    Restangular.one('user/register_request/list').get().then(function(data) {
      $scope.requests = data.requests;
      // Initialize password and storage_quota for each request
      angular.forEach($scope.requests, function(request) {
        request.password = '';
        request.storage_quota = 0;
      });
    });
  };

  $scope.loadData();

  /**
   * Approve a registration request.
   */
  $scope.approveRequest = function (request) {
    if (!request.password || request.storage_quota === undefined) {
      var title = $translate.instant('settings.registration.approve_error_title');
      var msg = $translate.instant('settings.registration.approve_error_message');
      var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns);
      return;
    }

    var storageQuotaBytes = request.storage_quota * 1000000; // Convert MB to bytes

    Restangular.one('user/register_request/' + request.id + '/approve').post('', {
      password: request.password,
      storage_quota: storageQuotaBytes
    }).then(function () {
      $scope.loadData(); // Reload data to reflect changes
      var title = $translate.instant('settings.registration.approve_success_title');
      var msg = $translate.instant('settings.registration.approve_success_message');
      var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns);
    });
  };

  /**
   * Reject a registration request.
   */
  $scope.rejectRequest = function (request) {
    Restangular.one('user/register_request/' + request.id + '/reject').post().then(function () {
      $scope.loadData(); // Reload data to reflect changes
      var title = $translate.instant('settings.user.reject_success_title');
      var msg = $translate.instant('settings.user.reject_success_message');
      var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns);
    });
  };
});