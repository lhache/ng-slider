angular.module('sliderDemo', ['ngSliderModule']).
	controller('sliderDemoCtrl',['$scope', function($scope) {
		$scope.sliderValues = [
			{
				from: 0,
				to: 10,
				value: 5,
				step: 1
			},
			
			{
				from: 100,
				to: 500,
				value: [250, 450],
				step: 10
			}
		];
	}]);