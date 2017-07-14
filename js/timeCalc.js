
function calcTime() {
  var now = new Date();
  setClock(now);
  setTimeout("calcTime()",500);
}

function setClock(time){
  var nowHour = time.getHours();
  var nowMin = time.getMinutes();
  var nowSec = time.getSeconds();

  document.getElementById("timeClock").innerText = time;
}

$(document).ready(function(){
	calcTime();
});

