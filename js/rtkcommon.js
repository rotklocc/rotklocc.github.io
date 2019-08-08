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
	
	createSideBarMenu();
	
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
		
		// get cookie for user lang
		var cookie = getCookie("l");
		if (cookie !== "")
			selLang = parseInt(cookie);
		cookie = getCookie("l2");
		if (cookie !== "")
			selLang2 = parseInt(cookie);
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
	// set cookie to save user lang
	setCookie("l", selLang);
	setCookie("l2", selLang2);
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
	if (tkey === '' || !(tkey in localizes))
		return tkey
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

function toLocalizes(tkey, sep="<br/>", biLang=true) {
	var txt = toLocalizeLang(tkey, selLang);
	if (biLang && selLang2 !== -1) {
		txt += sep;
		txt += toLocalizeLang(tkey, selLang2);
	}
	return txt;
}

function localizePassiveName(passiveId, val, sep="<br/>", biLang=true, showVal=true) {
	var passive = passives[passiveId];
	var txt = toLocalize(passive['name']);
	// list of passive that should have value
	// 2200062: Critical Attack+
	// 2200005: Expand AoE
	// 2200002: Expand ATK RNG
	if (showVal) {
		value_pids = [2200062, 2200005, 2200002];
		if (val !== -1 && (passive["desc"].indexOf("{0}") !== -1 || value_pids.indexOf(passiveId) !== -1)) {
			txt += " (" + val + ")";
		}
	}
	
	if (biLang && selLang2 !== -1) {
		txt += sep;
		txt += toLocalizeLang(passive['name'], selLang2);
	}
	return txt
}

function getPassiveDescSimple(passiveId, passiveVal, langId) {
	var desc;
	if (passiveId == 2200005) // Expand AoE
		desc = toLocalizeLang(atkDmgShapes[passiveVal]['desc'], langId);
	else if (passiveId == 2200002) // Expand ATK RNG
		desc = toLocalizeLang(atkRngShapes[passiveVal]['desc'], langId);
	else
		desc = toLocalizeLang(passives[passiveId]['desc'], langId);
	
	while (desc.indexOf('{0}') !== -1) {
		desc = desc.replace('{0}', passiveVal);
	}
	return desc;
}

function localizePassiveDescSimple(passiveId, passiveVal, sep="<br/>") {
	var txt = getPassiveDescSimple(passiveId, passiveVal, selLang);
	if (selLang2 !== -1) {
		txt += sep + getPassiveDescSimple(passiveId, passiveVal, selLang2);
	}
	return txt;
}

function getPassiveDesc(passiveList, langId) {
	var passiveId = passiveList['passiveId'];
	var passive = passives[passiveId];
	var desc;
	if (passiveId == 2200005) // Expand AoE
		desc = toLocalizeLang(atkDmgShapes[passiveList['val']]['desc'], langId);
	else if (passiveId == 2200002) // Expand ATK RNG
		desc = toLocalizeLang(atkRngShapes[passiveList['val']]['desc'], langId);
	else
		desc = toLocalizeLang(passive['desc'], langId);
	
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
			desc = desc.replace('{3}', toLocalizeLang(conditions[condId]['name'], langId));
	}
	if (desc.indexOf('{4}') !== -1) {
		condId = 2100000 + passiveList['conditionVal'][1];
		if (condId in conditions)
			desc = desc.replace('{4}', toLocalizeLang(conditions[condId]['name'], langId));
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
	txt += "<b>Description:</b><br/>" + localizePassiveDescSimple(passiveId, passiveVal);
	
	if (passiveId == 2200005) {  // Expand AoE
		txt += '<p>' + getShapeHtml(passiveVal, false) + '</p>';
	}
	else if (passiveId == 2200002) {  // Expand ATK RNG
		txt += '<p>' + getShapeHtml(passiveVal, true) + '</p>';
	}
	
	if ('tileAdvs' in passive) {
		txt += '<p>' + getTileAdvHtml(passive['tileAdvs']) + '</p>';
	}
	
	return txt;
}

function getHtmlPassiveListDesc(passiveList, hasStackInfo=true) {
	var passiveId = passiveList['passiveId'];
	var passive = passives[passiveId];
	
	var txt = "";
	if (hasStackInfo)
		txt += "<b>Stack:</b> " + (passive["accumulate"] == 0 ? "No" : "Yes") + "<br/>";
	txt += "<b>Description:</b><br/>" + localizePassiveListDesc(passiveList);
	
	if (passiveId == 2200005) {  // Expand AoE
		txt += '<p>' + getShapeHtml(passiveList["val"], false) + '</p>';
		//txt += '<p>' + getPassiveIconHtml(atkDmgShapes[passiveList['val']]['icon']) + '</p>';
	}
	else if (passiveId == 2200002) {  // Expand ATK RNG
		txt += '<p>' + getShapeHtml(passiveList["val"], true) + '</p>';
	}
	
	if ('tileAdvs' in passive) {
		txt += '<p>' + getTileAdvHtml(passive['tileAdvs']) + '</p>';
	}
	
	return txt;
}

function getTileAdvHtml(tileAdvs) {
	var html = '<table class="stats">';
	html += '<tr><th>Terrain Name</th><th>Value</th></tr>';
	for (tileId in tileAdvs)
		html += '<tr><td>' + toLocalizes(tiles[tileId], ' ') + '</td><td>' + tileAdvs[tileId] + '</td></tr>';
	html += '</table>';
	return html;
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

function openNav() {
	document.getElementById("mySidebar").style.width = "240px";
}

function closeNav() {
	document.getElementById("mySidebar").style.width = "0";
}

function createSideBarMenu() {
	var body = document.getElementsByTagName("BODY")[0];
	
	var ele = document.createElement("div");
	ele.id = 'sideMenuBtn';
	ele.className = 'float-button';
	ele.innerHTML = '<button onclick="openNav()">☰</button>';
	body.appendChild(ele);
	
	var ele = document.createElement("div");
	ele.id = 'mySidebar';
	ele.className = 'sidenav';
	
	var html = '<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>';
	html += '<a href="commanders.html">Commanders</a>';
	html += '<a href="tactics.html">Tactics</a>';
	html += '<a href="terrains.html">Terrains</a>';
	html += '<br/>';
	html += '<a href="simulator.html">Calculator</a>';
	html += '<br/>';
	html += '<a href="artifacts.html">Artifacts</a>';
	html += '<a href="artifactUpgradeStats.html">Artifacts Upgrade</a>';
	html += '<a href="artifactUpgradePassives.html">Artifact Passives</a>';
	html += '<br/>';
	html += '<a href="relics.html">Relics</a>';
	html += '<a href="relicPassives.html">Relic Passives</a>';
	html += '<a href="relicSets.html">Relic Sets</a>';
	html += '<br/>';
	html += '<a href="stories.html">Stories</a>';
	html += '<a href="friendships.html">Friendships</a>';
	html += '<br/>';
	html += '<a href="feats.html">Feats</a>';
	html += '<a href="guildMissions.html">Guild Missions</a>';
	html += '<a href="shop.html">Shop</a>';
	
	ele.innerHTML = html;
	body.appendChild(ele);
}

function _iconHtml(iconType, icon, extraClass) {
	var className = iconType + ' ' + extraClass;
	return icon ? '<span class="'+className+'" style="background-position: -'+icon[0]+'px -'+icon[1]+'px"></span>' : '';
}

function makePreTxtIconHtml(iconHtml, hidden=false) {
	var txt = hidden ? ' style="display:none"' : '';
	return '<span class="icon-pretxt"' + txt + '>' + iconHtml + "</span>";
}

function getFaceIconHtml(iconName, extraClass="") {
	return _iconHtml('face', faceImgs[iconName], extraClass);
}

function getMagicIconHtml(iconName, extraClass="") {
	return _iconHtml('magic', magicIcons[iconName], extraClass);
}

function getConditionIconHtml(iconName, extraClass="") {
	return _iconHtml('condition', conditionIcons[iconName], extraClass);
}

function getPassiveIconName(passiveId, passiveVal) {
	if (passiveId == 2200005) {  // Expand AoE
		return atkDmgShapes[passiveVal]['icon'];
	}
	else if (passiveId == 2200002) {  // Expand ATK RNG
		return atkRngShapes[passiveVal]['icon'];
	}
	return passives[passiveId]['icon'];
}

function getPassiveListIconName(passiveList) {
	return getPassiveIconName(passiveList['passiveId'], passiveList['val']);
}

function getPassiveIconNameHtml(iconName, extraClass="") {
	var icon = passiveIcons[iconName];
	if (!icon)  // some passive icon is in magic
		return getMagicIconHtml(iconName, extraClass)
	return _iconHtml('passive', icon, extraClass);
}

function getPassiveIconHtml(passiveId, passiveVal, extraClass="") {
	var iconName = getPassiveIconName(passiveId, passiveVal);
	return getPassiveIconNameHtml(iconName, extraClass);
}

function getPassiveListIconHtml(passiveList, extraClass="") {
	return getPassiveIconHtml(passiveList['passiveId'], passiveList['val'], extraClass);
}

function getPassiveIconInfo(iconName) {
	var icon = passiveIcons[iconName];
	if (icon)
		return [ 'passive', icon ];
	// some passive icon is in magic
	icon = magicIcons[iconName];
	return [ 'magic', icon ];
}

function getMagicIconInfo(iconName) {
	return magicIcons[iconName];
}

function getArtifactIconHtml(iconName, extraClass="") {
	return _iconHtml('artifact', artifactIcons[iconName], extraClass);
}

function getRelicIconHtml(iconName, extraClass="") {
	return _iconHtml('relic', relicIcons[iconName], extraClass);
}

function isTypeHeavyCavalry(typeId) {
	return ([1210001, 1210007, 1210009, 1210017, 1210069, 1210070, 1210078].indexOf(typeId) !== -1);
}

function getRelationTriggerText(triggerType, unitCount, biLang=true) {
	var html;
	if (triggerType === 0) {
		if (unitCount === 0)
			html = toLocalizes('모두 출진 시 발동', '<br/>', biLang);
		else
			html = toLocalizes('{0}명 이상 출진 시 발동', '<br/>', biLang).format(unitCount);
	}
	else if (triggerType === 1) {
		if (unitCount === 0)
			html = toLocalizes('퇴각 시 발동', '<br/>', biLang);
		else
			html = toLocalizes('{0}명 이상 퇴각 시 발동', '<br/>', biLang).format(unitCount);
	}
	else if (triggerType === 2) {
		if (unitCount === 0)
			html = toLocalizes('인접 시 발동', '<br/>', biLang);
		else
			html = toLocalizes('{0}명 이상 인접 시 발동', '<br/>', biLang).format(unitCount);
	}
	return html;
}
