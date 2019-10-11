var gpTypeFrameClasses = ["", "frame-green", "frame-red", "frame-blue"];

// init arena units by merging banner units
for (var i = 0; i < units.length; i++)
	arenaUnits[units[i]['id']] = units[i];
// init arena artifacts
for (var i = 0; i < artifacts.length; i++)
	arenaArtifacts[artifacts[i]['id']] = artifacts[i];

function victoryTextHtml(txts) {
	var lines = toLocalizeStoryVictoryTexts(txts);
	return lines.join('<br/>');
}

function weatherIds2Names(weatherIds) {
	var names = [];
	for (var i = 0; i < weatherIds.length; i++) {
		names.push(toLocalizes(weatherNames[weatherIds[i]], " "));
	}
	return names.join(', ');
}

// map to our weather name array
var weatherFlagMap = { 1: 0, 2: 1, 4: 2, 8: 4, 16: 3, 32: 5 };
function weatherFlag2Name(weatherFlag) {
	return weatherNames[weatherFlagMap[weatherFlag]];
}

function _popupStageInfo(stage) {
	document.getElementById("modalHeader").innerHTML = toLocalize(stage['name']);
	
	var html = '';
	html += '<div><b>Map:</b> '+toLocalizes(tiles[stage['tile']], ' &nbsp;')+'</div>';
	html += '<div><b>Max Turn:</b> '+stage['turn']+'</div>';
	html += '<div><b>Weather:</b> '+weatherIds2Names(stage['weather'])+'</div>';
	if (Object.keys(stage['weatherFix']).length !== 0) {
		html += '<div><b>Fix Weather:</b><br>';
		for (var turn in stage['weatherFix']) {
			html += '- Turn '+turn+': '+ toLocalizes(weatherFlag2Name(stage['weatherFix'][turn]), ' ') + '<br/>';
		}
		html += '</div>';
	}
	
	// victory text
	html += '<div style="padding-top: 15px">';
	html += '<span><b>'+toLocalize("승리조건")+'</b></span>';
	html += '<p style="margin: 2px 0 8px 10px">'+victoryTextHtml(stage['victoryInfo']['winTxt'])+'</p>';
	html += '<span><b>'+toLocalize("패배조건")+'</b></span>';
	html += '<p style="margin: 2px 0 0 10px">'+victoryTextHtml(stage['victoryInfo']['loseTxt'])+'</p>';
	html += '</div>';
	
	// missions
	html += '<div style="padding-top: 15px">';
	html += '<span><b>Missions:</b></span>';
	// Note: missionHtml for arena has unit name. so it's safe to pass empty string
	html += '<p style="margin: 2px 0 8px 10px">'+missionsHtml(stage['mission'], '')+'</p>';
	html += '</div>';

	document.getElementById("modalContent").innerHTML = html;
	document.getElementById("modalDiv").style.display = "block";
}	

function _popupGlobalPassiveInfo() {
	var gpType = this.gpInfo[0];
	var plist = arenaPassiveLists[this.gpInfo[1]];
	
	var name = toLocalize(globalPassiveTypes[gpType]) + localizePassiveListName(plist, '', false);
	var hdr = makePreTxtIconHtml(getPassiveListIconHtml(plist, gpTypeFrameClasses[gpType])) + "&nbsp;" + name;
	document.getElementById("modalHeader").innerHTML = hdr;
	document.getElementById("modalContent").innerHTML = getHtmlPassiveListDesc(plist);
	document.getElementById("modalDiv").style.display = "block";
}

function _createGlobalPassiveSpan(gpInfo) {
	var gpType = gpInfo[0];
	var plist = arenaPassiveLists[gpInfo[1]];
	
	var iconName = getPassiveIconName(plist['passiveId'], plist['val']);
	var iconInfo = getPassiveIconInfo(iconName);
	var span = document.createElement('span');
	span.style.marginRight = "3px";
	span.classList.add("clickable");
	span.classList.add(iconInfo[0]);
	span.classList.add(gpTypeFrameClasses[gpType]);
	span.style.backgroundPosition = "-"+iconInfo[1][0]+"px -"+iconInfo[1][1]+"px";
	span.gpInfo = gpInfo;
	span.onclick = _popupGlobalPassiveInfo;
	return span
}

function _createUnitSmallFaceSpan(faceName, extraClass='') {
	var span = document.createElement('span');
	span.className = "face-small clickable "+extraClass;
	span.innerHTML = getFaceIconHtml(faceName);
	return span;
}

function _getUnitInfoHtml(unit) {
	var txt = "";

	txt += "<div>";
	txt += 'Name: '+toLocalizes(unit['name'], ' &nbsp; ') + '<br/>';
	// TODO: unit types for non heroes (animal, 4gods, ...)
	if (unit["jobTypeId"] in unitTypes) {
		txt += "Type: " + toLocalizes(unitTypes[unit["jobTypeId"]]["name"], " &nbsp; ") + "<br/>";
	}
	txt += "</div>";
	
	txt += '<p>';
	txt += '<table class="stats"><tr><th>STR</th><th>INT</th><th>CMD</th><th>DEX</th><th>LCK</th></tr>';
	txt += "<tr>";
	txt += "<td>" + unit["str"] + "</td>";
	txt += "<td>" + unit["int"] + "</td>";
	txt += "<td>" + unit["cmd"] + "</td>";
	txt += "<td>" + unit["dex"] + "</td>";
	txt += "<td>" + unit["lck"] + "</td>";
	txt += "</tr></table>";
	txt += '</p>';
	
	return txt;
}
