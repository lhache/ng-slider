describe('Angular Slider directive', function() {
	var $compile, $rootScope, $document, $location;

	beforeEach(module('ngSliderModule'));

	// VALUES IN GENERAL
	// it should change value when handle is moved
	// it should have a value which is a multiple of scope.step
	// it should never have a handle out of the bar

	// FOR ONE VALUE
	// it should have only one handle when only one value
	// it should have an overlay the same size as the background when max value
	// it should move the handle where the bar is clicked
	// it should move the handle while the mouse is down and moving

	// FOR TWO VALUES
	// it should have a left handle < to right handle
	// it should have an overlay between the two handles
	// it should select the nearest handle when click
});
