document.addEventListener('DOMContentLoaded', function () {
    var runButton = document.getElementById('runButton');
    runButton.addEventListener('click', run);

    var addButton = document.getElementById('addButton');
    addButton.addEventListener('click', addGroup);
    loadChanges();
});

addEventListener("unload", function (event) {
	alert('test');
}, true);

function run() {
	saveChanges();
	changeColor();
}

function changeColor() {
	inputElement = document.getElementById("input-1")
	colorElement = document.getElementById("color-1")

	var info = {
		selector: inputElement.value,
		color: colorElement.value
	};

	chrome.tabs.executeScript({
	  code: 'var colorParams = ' + JSON.stringify(info)
	}, function() {
		chrome.tabs.executeScript({
			file: '/js/content.js'	
		});
	});
}

function addGroup(colorInfo) {
	var template = $("#color-group-template").html();
	var group = $(template).appendTo('.content');
	if(colorInfo != undefined) {
		// Fill the color and selector elements with the correct values.
		var colorEl    = group.find('.input-color').val(colorInfo.color);
		var selectorEl = group.find('.input-selector').val(colorInfo.selector);
	}
}

function saveChanges() {
	// Get a value saved in a form.

	let colorGroups = $('.color-group');
	var data = [];

	colorGroups.each(function(index) {
		var colorInput = $(this).find('.input-color');
		var selectorInput = $(this).find('.input-selector');

		var color = colorInput.val();
		var selector = selectorInput.val();

		data.push({color: color, selector: selector});
	});

	chrome.storage.sync.set({'data': data}, function() {
		console.log('saved');
	});
}

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