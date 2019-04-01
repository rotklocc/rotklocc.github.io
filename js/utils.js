function createSpaceNode(width) {
	var span = document.createElement('span');
	span.style.display = 'inline-block';
	span.style.width = width;
	return span;
}
	
function createTextNode(tag, txt) {
	var td = document.createElement(tag);
	var txt = document.createTextNode(txt);
	td.appendChild(txt);
	return td;
}

function createHtmlNode(tag, html, id=null) {
	var ele = document.createElement(tag);
	ele.innerHTML = html;
	if (id !== null)
		ele.id = id;
	return ele;
}

function createTdTextNode(txt) {
	var td = document.createElement("td");
	var txt = document.createTextNode(txt);
	td.appendChild(txt);
	return td;
}

function createTdHtmlNode(html) {
	var td = document.createElement("td");
	td.innerHTML = html;
	return td;
}

function createInputRadio(name, val, id=null) {
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = name;
	if (id !== null)
		radio.id = id;
	radio.value = val;
	return radio;
}

function createLabel(inputId, text) {
	var label = document.createElement("label");
	label.htmlFor = inputId;
	label.innerHTML = text;
	return label;
}

function createOptionNode(txt, val) {
	var option = document.createElement("option");
	option.text = txt;
	option.value = val;
	return option;
}

function createTdNumberColorTagNode(spanClass, num) {
	var txt = '<span class="'+spanClass+'">&#x25AE;</span>&nbsp;' + (num ? num : '-')
	return createTdHtmlNode(txt);
}

String.prototype.format = function() {
	var a = this;
	for (var k in arguments) {
		a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
	}
	return a
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = (exdays === 0) ? "" : "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function dynamicCompareSortTable(table, colIdx) {
	var sortedCol = -1;
	var sortedAsc = (table.getAttribute('defaultSortAsc') === "1");
	
	if ('sortedCol' in table) {
		sortedCol = table['sortedCol'];
	}

	if (sortedCol === colIdx) {
		// Note: can do reverse instead of sorting (should be faster for large table)
		// Note: 'sortedAsc' propery is always existed because 'sortedCol' must be existed to get in this case
		sortedAsc = !table['sortedAsc'];
	}
	sortedCol = colIdx;
	
	// save current sort order to table object
	table['sortedCol'] = sortedCol;
	table['sortedAsc'] = sortedAsc;

	return function (a, b) {
		var aval = a.cells[sortedCol].svalue;
		var bval = b.cells[sortedCol].svalue;
		var ret = (aval < bval) ? -1 : (aval > bval) ? 1 : 0;
		return sortedAsc ? ret : -ret;
	}
}

function sortTableRows(table, colIdx) {
	var rows = table.rows;
	var rowParent = rows[0].parentNode;
	var nrow = rows.length;
	
	// copy all rows to array
	var rowArr = new Array(nrow);
	for (var i = 0; i < nrow; i++) {
		rowArr[i] = rows[i];
	}
	// sort
	rowArr.sort(dynamicCompareSortTable(table, colIdx));
	// re-add all rows back (much faster than using parentNode.insertBefore() for swapping rows)
	rowParent.innerHTML = "";
	for (var i = 0; i < nrow; i++) {
		rowParent.appendChild(rowArr[i]);
	}
}
