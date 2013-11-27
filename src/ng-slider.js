// ng-slider directive
var ngSliderMod = angular.module('ngSliderModule', [])
  .directive('ngSlider', function($document) {
      return {
          restrict: 'EA',
          replace: true,
          templateUrl: 'ng-slider.html',
          
          scope: {
              from: '=',
              to: '=',
              value: '=',
              step:'=',
              round: '='
          },

          link: function(scope, element, attrs) {

            var currentX = 0; x = 0; startX = 0;
            var widthPx = element[0].offsetWidth;
            var widthVal = scope.to - scope.from;
            var offsetLeft = element[0].offsetLeft;

            var handles = [], currentHandle, handlesTmp = element.find('a');
            var overlay = angular.element(element.find('div')[0]);

            if (!angular.isArray(scope.value) && angular.isNumber(parseFloat(scope.value))) {
                scope.value = [scope.value];
                handlesTmp[1].remove();
                handlesTmp.length = 1;
            }

            for (var i=0; i<handlesTmp.length; i++)
            {
                handles.push({
                    index: i,
                    element: angular.element(handlesTmp[i]),
                    pos: 0
                });
            }

            delete handlesTmp;

            function computeValue(posPx) {
                posPx = checkBoundaries(posPx);

                var posVal = widthVal * posPx / widthPx + scope.from;
                var stepNumber = Math.round((posVal - scope.from) / scope.step)

                return scope.step * stepNumber + scope.from;
            }

            function setValue(value) {
                scope.value[currentHandle.index] = value;
                scope.$apply();
            }

            function computePosition(posVal) {
                var handleWidth = 14;
                var overlayLeft = 0, overlayWidth = 0;
                var posPx = (posVal - scope.from) * widthPx / widthVal;

                currentHandle.element.css({
                    left:  posPx - handleWidth/2 + 'px'
                });

                currentHandle.pos = posPx - handleWidth/2;

                overlayWidth = posPx;
                if (handles.length > 1) {
                    // TODO overlay between the two handles
                }

                overlay.css({
                    left: overlayLeft + 'px',
                    width:  overlayWidth + 'px'
                });
            }

            function selectHandle(posPx) {
                var handle, distance = Number.POSITIVE_INFINITY;

                for (var i in handles) {
                    var currentDistance = Math.abs(handles[i].pos - posPx);
                    
                    if (currentDistance < distance) {
                        distance = currentDistance;
                        handle = handles[i];
                    }
                }

                return handle;
            }

            function checkBoundaries(x) {
                if (x < 0) x = 0;
                if (x > widthPx) x = widthPx;

                //TODO handle 0 < handle 1
                // + handle 1 > handle 0

                return x;
            }

            function onMouseMove(event) {
                var currentX = event.pageX - offsetLeft;
                var value = computeValue(currentX);
                setValue(value);
            }

            function onMouseUp() {
                $document.unbind('mousemove', onMouseMove);
                $document.unbind('mouseup', onMouseUp);
            }

            element.on('mousedown', function(event) {
                event.preventDefault();

                $document.on('mousemove', onMouseMove);
                $document.on('mouseup', onMouseUp);

                var currentX = event.pageX - offsetLeft;
                currentHandle = selectHandle(currentX);
                var value = computeValue(currentX);
                setValue(value);
            });

            scope.$watch('value', function(newValue, oldValue) {

                if (currentHandle == undefined) {
                    for (var i in handles) {
                        currentHandle = handles[i];
                        computePosition(newValue[i])
                    }
                }
                else {
                    computePosition(newValue[currentHandle.index]);
                }

            }, true);
          }
  }
  });