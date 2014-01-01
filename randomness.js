'use strict'

var nodeID = (function() {
	var theRandomValue = ''
		, randomValues = new Uint8ClampedArray(20);
	window.crypto.getRandomValues(randomValues);

	for (var aRandomValueIndex = randomValues.length - 1; aRandomValueIndex >= 0; aRandomValueIndex--) {

		var aRandomValue = randomValues[aRandomValueIndex]
			,	randomToBits = (aRandomValue >>> 0).toString(2);
		if (randomToBits.length < 8) {

			var diff = 8 - randomToBits.length;
			for (var paddingIndex = 0; paddingIndex < diff; paddingIndex++) {

				randomToBits = "0" + randomToBits;
			};
		};
		theRandomValue += randomToBits;
	};

	return theRandomValue;
})();

(function() {
	console.log(nodeID);
  var res = BEncode.encode(["aaa", 1, "a", {a:1, b:2}]);
  console.log(res);
  console.log(BEncode.decode(res));
})();
