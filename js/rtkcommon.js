var langArr = ['kr', 'jp', 'zh', 'tw', 'en', 'vn', 'th'];
var langTxt = ['KR', 'JP', 'ZH', 'ZH-TW', 'EN', 'VN', 'TH'];
var selLang = 4; // default to english
var selLang2 = -1;

var cbLangChanged = null;
function setLangChangeCallback(cb) {
	cbLangChanged = cb;
}

function rtkWebCommonInit() {
	getUserLangs();
	createHtmlLangSelection();
	
	// set modal close functionality if existed
	var modal = document.getElementById("modalDiv");
	if (modal) {
		// When the user clicks on <span> (x), close the modal
		document.getElementById("closeModal").onclick = function() {
			document.getElementById("modalDiv").style.display = "none";
		}
		
		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
			var modal = document.getElementById("modalDiv");
			if (event.target == modal) {
				modal.style.display = "none";
			}
		}
	}
}

function createHtmlLangSelection() {
	var ele = document.getElementById("langSelection");
	ele.appendChild(createTextNode("label", "Lang: "));
	var sel = document.createElement("select");
	sel.id = "lang";
	sel.onchange = setLang;
	for (var i = 0; i < langTxt.length; i++) {
		sel.appendChild(createOptionNode(langTxt[i], i));
	}
	sel.value = selLang;
	ele.appendChild(sel);
	
	ele.appendChild(createTextNode("label", " Lang2: "));
	sel = document.createElement("select");
	sel.id = "lang2";
	sel.onchange = setLang2;
	sel.appendChild(createOptionNode("", -1));
	for (var i = 0; i < langTxt.length; i++) {
		sel.appendChild(createOptionNode(langTxt[i], i));
	}
	sel.value = selLang2;
	ele.appendChild(sel);
}

function getUserLangs() {
	var url = window.location.href;
	var parts = url.split('#');
	if (parts.length === 1) {
		// no argument. do nothing
		return;
	}
	
	var paramTxt = parts[1];
	var paramArr = paramTxt.split('&');
	for (var i = 0; i < paramArr.length; i++) {
		parts = paramArr[i].split('=');
		if (parts[0] === "l") {
			var idx = langArr.indexOf(parts[1].toLowerCase());
			if (idx !== -1)
				selLang = idx;
		}
		else if (parts[0] === "l2") {
			var idx = langArr.indexOf(parts[1].toLowerCase());
			if (idx !== -1)
				selLang2 = idx;
		}
	}
}

function setUserLang() {
	var url = window.location.href.split('#')[0];
	var paramTxt = "#l=" + langArr[selLang];
	if (selLang2 !== -1) {
		paramTxt += "&l2=" + langArr[selLang2];
	}
	window.location.href = url + paramTxt;
}

function setLang() {
	selLang = Number(this.value);
	setUserLang();
	if (cbLangChanged)
		cbLangChanged();
}

function setLang2() {
	selLang2 = Number(this.value);
	setUserLang();
	if (cbLangChanged)
		cbLangChanged();
}

function toLocalizeLang(tkey, langIdx) {
	txt = localizes[tkey][langIdx];
	if (txt.length === 0)
		txt = localizes[tkey][0]; // fall back to KR if no localization for specific language
	return txt
}

function toLocalize(tkey) {
	return toLocalizeLang(tkey, selLang);
}

function toLocalize2(tkey) {
	return toLocalizeLang(tkey, selLang2);
}

function toLocalizes(tkey, sep="<br/>") {
	var txt = toLocalizeLang(tkey, selLang);
	if (selLang2 !== -1) {
		txt += sep;
		txt += toLocalizeLang(tkey, selLang2);
	}
	return txt;
}

function localizePassiveName(passiveId, val, sep="<br/>") {
	var passive = passives[passiveId];
	txt = toLocalize(passive['name']);
	// list of passive that should have value
	// 2200062: Critical Attack+
	// 2200005: Expand AoE
	// 2200002: Expand ATK RNG
	value_pids = [2200062, 2200005, 2200002];
	if (val !== -1 && (passive["desc"].indexOf("{0}") !== -1 || value_pids.indexOf(passiveId) !== -1)) {
		txt += " (" + val + ")";
	}
	
	if (selLang2 !== -1) {
		txt += sep;
		txt += toLocalizeLang(passive['name'], selLang2);
	}
	return txt
}

function getPassiveDescSimple(passive, passiveVal, langId) {
	var desc = toLocalizeLang(passive['desc'], langId);
	while (desc.indexOf('{0}') !== -1) {
		desc = desc.replace('{0}', passiveVal);
	}
	return desc;
}

function getPassiveDesc(passiveList, langId) {
	var passive = passives[passiveList['passiveId']];
	var desc = toLocalizeLang(passive['desc'], langId);
	
	while (desc.indexOf('{0}') !== -1) {
		desc = desc.replace('{0}', passiveList['val']);
	}
	// {1} is terrain name
	if (desc.indexOf('{1}') !== -1) {
		desc = desc.replace('{1}', toLocalizeLang(tiles[passive['triggerTileValue']], langId));
	}
	if (desc.indexOf('{2}') !== -1) {
		desc = desc.replace('{2}', passiveList['triggerRateValue']);
	}
	
	// {3}, {4} are condition name
	if (desc.indexOf('{3}') !== -1) {
		condId = 2100000 + passiveList['conditionVal'][0];
		if (condId in conditions)
			desc = desc.replace('{3}', toLocalizeLang(conditions[condId], langId));
	}
	if (desc.indexOf('{4}') !== -1) {
		condId = 2100000 + passiveList['conditionVal'][1];
		if (condId in conditions)
			desc = desc.replace('{4}', toLocalizeLang(conditions[condId], langId));
	}
	return desc
}

function localizePassiveListDesc(passiveList, sep="<br/>") {
	var txt = getPassiveDesc(passiveList, selLang);
	if (selLang2 !== -1) {
		txt += sep + getPassiveDesc(passiveList, selLang2);
	}
	return txt;
}

function getHtmlPassiveDesc(passiveId, passiveVal) {
	var passive = passives[passiveId];
	var txt = "<b>Stack:</b> " + (passive["accumulate"] == 0 ? "No" : "Yes") + "<br/>";
	txt += "<b>Description:</b><br/>" + getPassiveDescSimple(passive, passiveVal, selLang);
	if (selLang2 !== -1) {
		txt += "<br/>" + getPassiveDescSimple(passive, passiveVal, selLang2);
	}
	
	if (passiveId == 2200005) {  // Expand AoE
		txt += '<p>' + getShapeHtml(passiveVal, false) + '</p>';
	}
	else if (passiveId == 2200002) {  // Expand ATK RNG
		txt += '<p>' + getShapeHtml(passiveVal, true) + '</p>';
	}
	
	return txt;
}

function getHtmlPassiveListDesc(passiveList) {
	var passiveId = passiveList['passiveId'];
	var passive = passives[passiveId];
	
	var txt = "<b>Stack:</b> " + (passive["accumulate"] == 0 ? "No" : "Yes") + "<br/>";
	txt += "<b>Description:</b><br/>" + getPassiveDesc(passiveList, selLang);
	if (selLang2 !== -1) {
		txt += "<br/>" + getPassiveDesc(passiveList, selLang2);
	}
	
	if (passiveId == 2200005) {  // Expand AoE
		txt += '<p>' + getShapeHtml(passiveList["val"], false) + '</p>';
	}
	else if (passiveId == 2200002) {  // Expand ATK RNG
		txt += '<p>' + getShapeHtml(passiveList["val"], true) + '</p>';
	}
	
	return txt;
}

function getShapeHtml(shapeId, isRange) {
	var arr;
	var markCenter = isRange;
	var borderCell = '<td></td>';
	if (shapeId === 0) {
		arr = [ [1] ];
	}
	else {
		if (isRange) {
			if (shapeId === 13) {
				borderCell = '<td class="mark"></td>';
				arr = [ [1,1,1], [1,1,1], [1,1,1] ];
				markCenter = false;
			}
			else {
				arr = rngShapes[shapeId];
			}
		}
		else {
			if (shapeId === 9) {
				borderCell = '<td class="mark"></td>';
				arr = [ [1,1,1], [1,1,1], [1,1,1] ];
			}
			else {
				arr = aoeShapes[shapeId];
			}
		}
	}
	
	var numY = arr.length;
	var numX = arr[0].length;
	
	var cenY = Math.floor(numY / 2);
	var cenX = Math.floor(numX / 2);
	
	var html = '<table class="atkShape">';
	html += '<tr>' + borderCell.repeat(numX+2) + '</tr>';
	for (var i = 0; i < numY; i++) {
		html += '<tr>' + borderCell;
		for (var j = 0; j < numX; j++) {
			var clsTxt = '';
			if (arr[i][j] !== 0) {
				if (markCenter && cenY === i && cenX === j)
					clsTxt = ' class="central"';
				else
					clsTxt = ' class="mark"';
			}
			html += '<td' + clsTxt +'></td>';
		}
		html += borderCell + '</tr>';
	}
	html += '<tr>' + borderCell.repeat(numX+2) + '</tr>';
	html += '</table>';
	return html;
}

function inLocalizeText(ktxt, needle) {
	if (ktxt in localizes) {
		var txts = localizes[ktxt];
		var searchTxt = needle.toUpperCase();
		for (var i = 0; i < txts.length; i++) {
			if (txts[i].toUpperCase().indexOf(searchTxt) !== -1)
				return true;
		}
	}
	
	return false;
}

function hasLocalizeText(ktxt, wordUpper) {
	if (ktxt in localizes) {
		var txts = localizes[ktxt];
		for (var i = 0; i < txts.length; i++) {
			if (txts[i].toUpperCase() === wordUpper)
				return true;
		}
	}
	
	return false;
}
