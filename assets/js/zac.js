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

function trans(){
	var content = document.getElementById("translate").value;
	var u1 = "http://dict.youdao.com/search?q=";
	var u2 = "&keyfrom=new-fanyi.smartResult";
	var url = u1 + content + u2;
	/* alert(url) */
	window.open(url);
}

function pre_page(){
	var content = document.getElementById("pageup").attributes["data-filter"].nodeValue;
	var index = content.split('-')[1]*1;
	if (index > 0){
		index -= 1	
	}
	else{
		alert('已经是第一页了，兄dei！')
	}
	var pu=document.getElementById("pageup").setAttribute("data-filter", '.cat-' + index);
	var pd=document.getElementById("pagedown").setAttribute("data-filter", '.cat-' + (index));
	/* alert('.cat-' + index) */
	
}

function next_page(limit){
	var content = document.getElementById("pagedown").attributes["data-filter"].nodeValue;
	var index = content.split('-')[1]*1;
	if (index < limit - 1){
	index += 1
	}
	else{
		alert('我是有底线的，兄dei！')
	}
	var pd=document.getElementById("pagedown").setAttribute("data-filter", '.cat-' + index);
	var pu=document.getElementById("pageup").setAttribute("data-filter", '.cat-' + (index));
	/* alert('.cat-' + index) */
	
}
