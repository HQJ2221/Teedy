'use strict';

/**
 * File modal view controller.
 */
angular.module('docs').controller('FileModalView', function ($uibModalInstance, $scope, $state, $stateParams, $sce, Restangular, $transitions) {
  var setFile = function (files) {
    // Search current file
    _.each(files, function (value) {
      if (value.id === $stateParams.fileId) {
        $scope.file = value;
        $scope.trustedFileUrl = $sce.trustAsResourceUrl('../api/file/' + $stateParams.fileId + '/data');
      }
    });
  };

  // Load files
  Restangular.one('file/list').get({ id: $stateParams.id }).then(function (data) {
    $scope.files = data.files;
    setFile(data.files);

    // File not found, maybe it's a version
    if (!$scope.file) {
      Restangular.one('file/' + $stateParams.fileId + '/versions').get().then(function (data) {
        setFile(data.files);
      });
    }
  });

  /**
   * Return the next file.
   */
  $scope.nextFile = function () {
    var next = undefined;
    _.each($scope.files, function (value, key) {
      if (value.id === $stateParams.fileId) {
        next = $scope.files[key + 1];
      }
    });
    return next;
  };

  /**
   * Return the previous file.
   */
  $scope.previousFile = function () {
    var previous = undefined;
    _.each($scope.files, function (value, key) {
      if (value.id === $stateParams.fileId) {
        previous = $scope.files[key - 1];
      }
    });
    return previous;
  };

  /**
   * Navigate to the next file.
   */
  $scope.goNextFile = function () {
    var next = $scope.nextFile();
    if (next) {
      $state.go('^.file', { id: $stateParams.id, fileId: next.id });
    }
  };

  /**
   * Navigate to the previous file.
   */
  $scope.goPreviousFile = function () {
    var previous = $scope.previousFile();
    if (previous) {
      $state.go('^.file', { id: $stateParams.id, fileId: previous.id });
    }
  };

  // define some variables
  $scope.isTranslating = false; // 是否正在翻译
  $scope.isTranslated = false; // 是否翻译完成
  $scope.translateMessage = ''; // 翻译消息
  $scope.translatedShow = false;

  /**
   * translate a file to ZH-CN
   */
  $scope.translate = function () {
    $scope.isTranslating = true; // 开始翻译
    Restangular.one('file/' + $stateParams.fileId + '/translate').post().then(function(response) {
      $scope.isTranslating = false; // 翻译完成
      $scope.isTranslated = true; // 翻译完成

      $scope.translateMessage = 'success';
      $scope.trustedFileUrl = $sce.trustAsResourceUrl('../api/file/' + response.fileId + '/data');
      // $scope.file.mimetype = 'application/pdf';
      $scope.translatedShow = true;

      // 显示成功提示
      var title = $translate.instant("Translate Successfully");
      var msg = $translate.instant("The file has been translated");
      var btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
      $dialog.messageBox(title, msg, btns);
    }, function(error) {
      $scope.isTranslating = false;

      // 显示错误提示
      var title = $translate.instant("Error");
      var msg = $translate.instant("Failed to translate the file");
      var btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
      $dialog.messageBox(title, msg, btns);
    })
  }

  /**
   * Open the file in a new window.
   */
  $scope.openFile = function () {
    window.open('../api/file/' + $stateParams.fileId + '/data');
  };

  /**
   * Open the file content a new window.
   */
  $scope.openFileContent = function () {
    window.open('../api/file/' + $stateParams.fileId + '/data?size=content');
  };

  /**
   * Print the file.
   */
  $scope.printFile = function () {
    var popup = window.open('../api/file/' + $stateParams.fileId + '/data', '_blank');
    popup.onload = function () {
      popup.print();
      popup.close();
    }
  };

  /**
   * Close the file preview.
   */
  $scope.closeFile = function () {
    $uibModalInstance.dismiss();
  };

  // Close the modal when the user exits this state
  var off = $transitions.onStart({}, function(transition) {
    if (!$uibModalInstance.closed) {
      if (transition.to().name === $state.current.name) {
        $uibModalInstance.close();
      } else {
        $uibModalInstance.dismiss();
      }
    }
    off();
  });

  /**
   * Return true if we can display the preview image.
   */
  $scope.canDisplayPreview = function () {
    return $scope.file && $scope.file.mimetype !== 'application/pdf';
  };
});