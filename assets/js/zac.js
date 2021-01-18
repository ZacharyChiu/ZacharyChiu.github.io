function cxkssr() {
	var num = Math.random()*10**12;
	num = Math.floor(num);
	mail = num + "@qq.com";
	document.getElementById("here").innerHTML = mail;
	
	var Url2=document.getElementById("here").innerText;
	var oInput = document.createElement('input');
	oInput.value = Url2;
	document.body.appendChild(oInput);
	oInput.select(); // 选择对象
	document.execCommand("Copy"); // 执行浏览器复制命令
	oInput.className = 'oInput';
	oInput.style.display='none';
	window.open("https://cxkssr.xyz/auth/register");
}


function cxkv2() {
	var num = Math.random()*10**12;
	num = Math.floor(num);
	mail = num + "@qq.com";
	document.getElementById("here").innerHTML = mail;
	
	var Url2=document.getElementById("here").innerText;
	var oInput = document.createElement('input');
	oInput.value = Url2;
	document.body.appendChild(oInput);
	oInput.select(); // 选择对象
	document.execCommand("Copy"); // 执行浏览器复制命令
	oInput.className = 'oInput';
	oInput.style.display='none';
	window.open("http://cxkv2.xyz/auth/register");
}


function search_google() {
	var content = document.getElementById("input").value;
	var google = "https://www.google.com/search?newwindow=1&q=";
	var url = google + content;
	window.open(url);
}