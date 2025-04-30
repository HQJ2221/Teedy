'use strict';

/**
 * Settings register controller.
 */
angular.module('docs').controller('SettingsRegistration', function($scope, $rootScope, Restangular, notificationService) {
  // 初始化注册表单模型
  $scope.registration = {
    username: '',
    password: '',
    email: ''
  };

  // 提交注册请求
  $scope.submitRegistration = function() {
    // 客户端基础验证
    if (!$scope.registration.username ||
      !$scope.registration.password ||
      !$scope.registration.email) {
      notificationService.error('请填写所有必填字段');
      return;
    }

    // 使用Restangular发送POST请求（与SettingsConfig的API调用方式一致）
    Restangular.one('user')
      .post('registration', $scope.registration)
      .then(function() {
        // 成功处理
        notificationService.success('注册请求已提交，请等待管理员审批');

        // 清空表单（保持界面状态）
        $scope.registration = {
          username: '',
          password: '',
          email: ''
        };
      })
      .catch(function(response) {
        // 错误处理（根据API返回的状态码显示不同提示）
        if (response.status === 409) {
          notificationService.error('用户名已被占用');
        } else if (response.status === 400) {
          notificationService.error('无效的邮箱格式');
        } else {
          notificationService.error('注册失败: ' + (response.data.message || '未知错误'));
        }
      });
  };

  // 可选：实时验证用户名可用性（类似SettingsConfig中的其他验证逻辑）
  $scope.checkUsernameAvailability = _.debounce(function() {
    if ($scope.registration.username.length < 3) return;

    Restangular.one('user/check_username')
      .get({ username: $scope.registration.username })
      .then(function(data) {
        $scope.usernameAvailable = data.available;
      });
  }, 300);
});
