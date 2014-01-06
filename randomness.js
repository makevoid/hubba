'use strict';

window.nodeID = (function() {
	var theRandomValue = ''
		, randomValues = new Uint8ClampedArray(20);
	window.crypto.getRandomValues(randomValues);

	for (var aRandomValueIndex = randomValues.length - 1; aRandomValueIndex >= 0; aRandomValueIndex -= 1) {

		var aRandomValue = randomValues[aRandomValueIndex]
			,	randomToBits = (aRandomValue >>> 0).toString(2);
		if (randomToBits.length < 8) {

			var diff = 8 - randomToBits.length;
			for (var paddingIndex = 0; paddingIndex < diff; paddingIndex += 1) {

				randomToBits = '0' + randomToBits;
			}
		}
		theRandomValue += randomToBits;
	}

	return theRandomValue;
})();
