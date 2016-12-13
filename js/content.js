colorParams.forEach(function(colorObject) {
	document.querySelectorAll(colorObject.selector).forEach(function(div) {
		div.style.backgroundColor = colorObject.color;
	});
})
