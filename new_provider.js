function request(tag, data, url) {
	let ss = "";
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		console.log(xhr.readyState + " " + xhr.status);
		if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
			ss = xhr.responseText;
		}

	};
	xhr.open(tag, url, false);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(data);
	return ss;
}

async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
	await loadTool('AIScheduleTools')
	try {
		htt = dom.getElementById("ylkbTable").outerHTML
	} catch (e) {
		// 首页
		try {
			let id;
			let arr = dom.getElementById("cdNav").outerHTML.match(/(?<=clickMenu\().*?(?=\);)/g)
			arr.every(v => {
				if (v.search("学生课表查询") != -1) {
					id = arr[i].split(",")[0].slice(1, -1)
					console.log(id)
					return true;
				}
			})
			let su = dom.getElementById("sessionUserKey").value
			let html = request("get", null, "/jwglxt/kbcx/xskbcx_cxXskbcxIndex.html?gnmkdm=" + id ?? 'N2151')
			console.log(su)
			dom = new DOMParser().parseFromString(html, "text/html")
			const userConfrim = await AIScheduleConfirm({
				titleText: '是否导入最新课表', // 标题内容，字体比较大，超过10个字不给显示的喔，也可以不传就不显示
				contentText: `是否导入当前学期课表，否则自行输入学期&学年
				`, // 提示信息，字体稍小，支持使用``达到换行效果，具体使用效果建议真机测试，为必传，不传显示版本号
				cancelText: '否', // 取消按钮文字，可不传默认为取消
				confirmText: '是', // 确认按钮文字，可不传默认为确认
			})
			if(userConfrim) { // 导入最新
				let form = dom.getElementById("ajaxForm")
				htt = JSON.stringify(JSON.parse(request("post", "xnm=" + form.xnm.value + "&xqm=" + form.xqm.value, "/jwglxt/kbcx/xskbcx_cxXsKb.html")).kbList)
				return JSON.stringify({ html: htt })
			}
			const userInput = await AISchedulePrompt({
				titleText: '输入学年及学期', // 标题内容，字体比较大，超过10个字不给显示的喔，也可以不传就不显示
				tipText: '以空格分隔，19年入学则大一上为2019 1 大二下为2020 2，效果同教务系统的课表查询页下拉框', 
				defaultText: '2022 1',
				validator: value => { // 校验函数，如果结果不符预期就返回字符串，会显示在屏幕上，符合就返回false
					console.log(value)
					if(!value) return '不能为空哦'
					const arr =	value.split(' ')
					if (arr?.length !== 2) return '要以空格分隔哦！'
					const [xnm, xqm] = arr
					if (!xnm ||!xqm) return '学年及学期不能为空'
					if (xnm.length!== 4 || xqm.length!== 1)  return '学年及学期格式不对！'
					return false
			}})
			const [ xnm, xqm ] = userInput.split(' ')
			console.log( {xnm, xqm} )
			htt = JSON.stringify(JSON.parse(request("post", "xnm=" + xnm + "&xqm=" + xqm, "/jwglxt/kbcx/xskbcx_cxXsKb.html")).kbList)
			return JSON.stringify({ html: htt })
		} catch (e) {
			console.log(e)
			await AIScheduleAlert(`
			导入失败，请确保当前位于【学生课表查询】页面或首页!
			----------------------------------
				 >>导入流程<<
			>>点击【信息查询】<<
			>>点击【学生课表查询】<<
			>>选择学年/学期<<
			 >>点击【一键导入】<<
			` + e)
		}
	}
	return JSON.stringify({ html: htt })
}