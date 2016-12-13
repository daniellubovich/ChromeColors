document.addEventListener('DOMContentLoaded', function () {
    var runButton = document.getElementById('runButton');
    runButton.addEventListener('click', run);

    var addButton = document.getElementById('addButton');
    addButton.addEventListener('click', addGroup);
    loadChanges();
});

// Runs on plugin load.
function run() {
	saveChanges();
	changeColor();
}

// Injects the colors into the page with /js/content.js
function changeColor() {
	let colorGroups = $('.color-group');
	var data = [];

	// Build color data to send to the tab.
	colorGroups.each(function(index) {
		var colorInput = $(this).find('.input-color');
		var selectorInput = $(this).find('.input-selector');

		var color = colorInput.val();
		var selector = selectorInput.val();

		data.push({color: color, selector: selector});
	});

	// Tell the tab to execute content.js
	chrome.tabs.executeScript({
	  code: 'var colorParams = ' + JSON.stringify(data)
	}, function() {
		chrome.tabs.executeScript({
			file: '/js/content.js'	
		});
	});
}

// Adds a new color group.
function addGroup(colorInfo) {
	var template = $("#color-group-template").html();
	var group = $(template).appendTo('.content');
	if(colorInfo != undefined) {
		// Fill the color and selector elements with the correct values.
		var colorEl    = group.find('.input-color').val(colorInfo.color);
		var selectorEl = group.find('.input-selector').val(colorInfo.selector);
	}
}

// Save our current data.
function saveChanges() {
	let colorGroups = $('.color-group');
	var data = [];

	// Build our color data.
	colorGroups.each(function(index) {
		var colorInput = $(this).find('.input-color');
		var selectorInput = $(this).find('.input-selector');

		var color = colorInput.val();
		var selector = selectorInput.val();

		data.push({color: color, selector: selector});
	});

	// Push the data to local storage.
	chrome.storage.sync.set({'data': data}, function() {
		console.log('saved');
	});
}

// Load our previously saved data, if there is any.
function loadChanges() {
	var template = $("#color-group-template").html();

	chrome.storage.sync.get('data', function(info) {
		var data = info.data;

		if(data.length) {
			data.forEach(function(el) {
				var group, colorEl, selectorEl;
				addGroup(el);
			});
		} else {
			$(template).appendTo('.content');
		}
	});
}