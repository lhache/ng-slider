angular.module('sliderDemo', ['ngSliderModule']).
	controller('sliderDemoCtrl',['$scope', function($scope) {

		$scope.simpleSlider = {	
			from: 0,
			to: 10,
			value: 5,
			step: 1
		};

		$scope.doubleSlider = {
			from: 100,
			to: 500,
			value: [250, 450],
			step: 10
		}

	}]);