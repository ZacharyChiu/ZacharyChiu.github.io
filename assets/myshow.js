function openDialog(event){
	/* 获取鼠标点击的元素 */
	var obj = document.elementFromPoint(event.clientX,event.clientY);
	/* 摁住浮窗原本显示的图片 */
	var ftimg = document.getElementById('ftimg');
	/* 查看目标图片的地址 */
	var imgname = obj.src;
	
	/* 把浮窗图片修改为目标图片 */
	ftimg.setAttribute('src',imgname);
	
	/* 修改浮窗图片原图链接 */
	var ftimgurl = document.getElementById('ftimgurl');
	ftimgurl.setAttribute('href',imgname);

	
	/* 拿取图片浮窗 */
	var ft1 = document.getElementById('f01');
	/* 让图片浮窗显示出来 */
	ft1.style.display='block';
	
	var ft2 = document.getElementById('f02');
	ft2.style.display='block';
	
	/* 获取鼠标点击的元素的id */
	var imgid = obj.id;
	/* 拼装出对应元素tags的id */
	var tagid = 't' + imgid;
	console.log(tagid);
	/* 根据通缉令抓住目标的tags */
	var tags = document.getElementById(tagid);
	console.log(tags.innerHTML);
	/* 把收获塞到浮窗里面 */
	var fttag = document.getElementById('fttags');
	fttag.innerHTML = tags.innerHTML;
}


function closeDialog(){
	document.getElementById('f01').style.display='none';
	document.getElementById('f02').style.display='none';
}


function smaller(){
	var liu = document.querySelector('.masonry');
	var st = getComputedStyle(liu);
	var now_num = parseInt(st['column-count']);
	var all_liu = document.getElementsByClassName('masonry');
	
	var  el = window.document.body; //声明一个变量，默认值为body
	window.document.body.onmouseover =  function (event){
	   el = event.target; //鼠标每经过一个元素，就把该元素赋值给变量el
	   // console.log( '当前鼠标在' , el,  '元素上' ); //在控制台中打印该变量
	   //console.log('B', document.getElementById(el.id).style.columnCount); //在控制台中打印该变量
	}
	for(i=0; i<all_liu.length; i++){
			document.getElementById(all_liu[i].id).style.columnCount = now_num+1;
			//console.log('>>第',i,'个瀑布流<<')
		}
	console.log(parseInt(st['column-count'])+1);
}

function bigger(){
	var liu = document.querySelector('.masonry');
	var st = getComputedStyle(liu);
	var now_num = parseInt(st['column-count']);
	var all_liu = document.getElementsByClassName('masonry');
	
	var  el = window.document.body; //声明一个变量，默认值为body
	window.document.body.onmouseover =  function (event){
	   el = event.target; //鼠标每经过一个元素，就把该元素赋值给变量el
	   // console.log( '当前鼠标在' , el,  '元素上' ); //在控制台中打印该变量
	   //console.log('B', document.getElementById(el.id).style.columnCount); //在控制台中打印该变量
	}
	
	if(now_num > 1){
		// document.getElementById('liu').style.columnCount = now_num-1;
		//console.log('A',all_liu[0].id);
		console.log(now_num-1);
		for(i=0; i<all_liu.length; i++){
			document.getElementById(all_liu[i].id).style.columnCount = now_num-1;
			// console.log('>>第',i,'个瀑布流<<')
		}
		
		
	}
}


function hotKey(){
	switch(event.which){
		case 27:
			closeDialog();
			break;
		case 83:
			// S键缩小视图
			smaller();
			break;
			
		case 87:
			// W键放大视图
			bigger();
			break;
		
		case 72:
			window.location.href = "MyWork.html";
			break;
		default:
	}
}
