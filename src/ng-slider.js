// ng-slider directive
var ngSliderMod = angular.module('ngSliderModule', [])


ngSliderMod.directive('ngSlider', function($document) {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: '/src/ng-slider.html',

        scope: {
            from: '=',
            to: '=',
            value: '=',
            step:'=',
            round: '='
        },

        link: function(scope, element, attrs) {

            var widthVal = scope.to - scope.from;
            var handleTop = 0;
            var valueBeforeChange;

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

                centerHandle(handles[i]);
            }

            delete handlesTmp;

            function width() {
                return element[0].offsetWidth;
            }

            function height() {
                return element[0].offsetHeight;
            }

            function left() {
                return element[0].offsetLeft;
            }

            function handleWidth() {
                return handles[0].element[0].clientWidth;
            }

            function centerHandle(handle) {
                var handleTop = (height() - handle.element[0].offsetHeight) / 2;
                handle.element.css({
                    top: handleTop + 'px'
                })
            }

            function selectHandle(x) {
                var handle;

                if (handles.length == 1) {
                    handle = handles[0];
                }
                else {
                    if (x <= handles[0].pos) {
                        handle = handles[0];
                    }
                    else if (x > handles[1].pos) {
                        handle = handles[1];
                    }
                    else if (x > handles[0].pos && x < handles[1].pos) {
                        var distance = Number.POSITIVE_INFINITY;

                        for (var i in handles) {
                            var currentDistance = Math.abs(handles[i].pos - x);

                            if (currentDistance < distance) {
                                distance = currentDistance;
                                handle = handles[i];
                            }
                        }
                    }
                    
                }

                return handle;
            }

            function roundToStep(val) {
                var stepNumber = Math.round((val - scope.from) / scope.step)
                return scope.step * stepNumber + scope.from;
            }

            function computeValue(x) {
                x = checkPosition(x);
                var val = widthVal * x / width() + scope.from;
                return roundToStep(val);
            }

            function computePosition(val) {
                val = checkValue(val);
                var x = (val - scope.from) * width() / widthVal;
                return x;
            }

            function checkValue(val) {
                if (val < scope.from) {
                    val = scope.from;
                }

                if (val > scope.to) {
                    val = scope.to;
                }

                if (val % scope.step != 0) {
                    val = roundToStep(val);
                }

                if (handles.length > 1) {
                    if (currentHandle.index == 0 && val >= scope.value[1]) {
                        val = scope.value[1];
                    }

                    if (currentHandle.index == 1 && val <= scope.value[0]) {
                        val = scope.value[0];
                    }
                }

                return val;
            }

            function checkPosition(x) {
                if (x < 0) {
                    x = 0;
                }

                if (x > width()) {
                    x = width();  
                } 

                if (handles.length > 1) {
                    if (currentHandle.index == 0 && x >= handles[1].pos) {
                        x = handles[1].pos;
                    }

                    if (currentHandle.index == 1 && x <= handles[0].pos) {
                        x = handles[0].pos;
                    }
                }

                return x;
            }

            function setValue(val) {
                scope.value[currentHandle.index] = val;
                scope.$apply();
            }

            function setPosition(pos) {
                var overlayLeft = 0, overlayWidth = 0;

                currentHandle.element.css({
                    left:  pos - handleWidth()/2 + 'px'
                });

                currentHandle.pos = pos;

                if (handles.length > 1) {
                    overlayWidth = handles[1].pos - handles[0].pos;
                    overlayLeft = handles[0].pos;
                }
                else
                {
                    overlayWidth = pos;
                }

                overlay.css({
                    left: overlayLeft + 'px',
                    width:  overlayWidth + 'px'
                });
            }


            function slide(event) {
                scope.$emit('slide', {'handle': currentHandle.index});

                var currentX = event.pageX - left();
                var value = computeValue(currentX);
                setValue(value);
            }

            function mouseUp() {
                var change = checkChange(scope.value, valueBeforeChange);
                if (change != -1) {
                    scope.$emit('change', {'handle': change});
                }

                $document.unbind('mousemove', slide);
                $document.unbind('mouseup', mouseUp);
            }

            element.on('mousedown', function(event) {
                event.preventDefault();

                if (event.which == 1) {
                    valueBeforeChange = scope.value.slice(0);

                    $document.on('mousemove', slide);
                    $document.on('mouseup', mouseUp);

                    var currentX = event.pageX - left();
                    currentHandle = selectHandle(currentX);
                    var value = computeValue(currentX);
                    setValue(value);
                }
            });

            function checkChange(newValue, oldValue) {
                var change = -1;
                for (var i in oldValue) {
                    if (oldValue[i] != newValue[i]) {
                        change = i;
                    }
                }
                return change;
            }

            scope.$watch('value', function(newValue, oldValue) {

                var currentPos = 0;
                var change = -1;

                if (currentHandle == undefined) {
                    for (var i in handles) {
                        currentHandle = handles[i];
                        currentPos = computePosition(newValue[i]);
                        setPosition(currentPos);
                    }
                }
                else {
                    change = checkChange(newValue, oldValue);

                    if (change != -1 && change != currentHandle.index) {
                        currentHandle = handles[change];
                    }

                    currentPos = computePosition(newValue[currentHandle.index]);
                    setPosition(currentPos);
                }

            }, true);

        }
    }
});