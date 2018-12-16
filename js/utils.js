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
	var expires = "expires="+d.toUTCString();
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

