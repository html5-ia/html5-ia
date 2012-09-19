// How to figure out what a user's computer can handle for frames with fallbacks
// Pulled from Paul Irish at http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame    ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();