function resolveCourseConflicts(result) {
	function pdSection(or, inn) {
		// console.log(or,inn)
		or.sort(function (a, b) {
			return a.section - b.section
		})
		inn.sort(function (a, b) {
			return a.section - b.section
		})
		if (JSON.stringify(or) === JSON.stringify(inn)) {
			return true;
		} else return false;
	}
	//将课拆成单节，并去重
	let allResultSet = new Set()
	result.forEach(singleCourse => {
		singleCourse.weeks.forEach(week => {
			singleCourse.sections.forEach(section => {
				let course = { sections: [], weeks: [] }
				course.name = singleCourse.name;
				course.teacher = singleCourse.teacher;
				course.position = singleCourse.position;
				course.day = singleCourse.day;
				course.weeks.push(week);
				course.sections.push(section)
				allResultSet.add(JSON.stringify(course))
			})
		})
	})
	let allResult = JSON.parse("[" + Array.from(allResultSet).toString() + "]").sort(function (b, e) {
		return b.day - e.day
	})

	//将冲突的课程进行合并
	let contractResult = [];
	while (allResult.length !== 0) {
		let firstCourse = allResult.shift();
		if (firstCourse == undefined) continue;
		let weekTag = firstCourse.day

		for (let i = 0; allResult[i] !== undefined && weekTag === allResult[i].day; i++) {
			if (firstCourse.weeks[0] === allResult[i].weeks[0]) {
				if (firstCourse.sections[0].section === allResult[i].sections[0].section) {
					let index = firstCourse.name.split('|').indexOf(allResult[i].name);
					if (index === -1) {
						firstCourse.name += "|" + allResult[i].name;
						firstCourse.teacher += "|" + allResult[i].teacher;
						firstCourse.position += "|" + allResult[i].position;
						firstCourse.position = firstCourse.position.replace(/undefined/g, '')
						allResult.splice(i, 1);
						i--;
					} else {
						let teacher = firstCourse.teacher.split("|");
						let position = firstCourse.position.split("|");
						teacher[index] = teacher[index] === allResult[i].teacher ? teacher[index] : teacher[index] + "," + allResult[i].teacher;
						position[index] = position[index] === allResult[i].position ? position[index] : position[index] + "," + allResult[i].position;
						firstCourse.teacher = teacher.join("|");
						firstCourse.position = position.join("|");
						firstCourse.position = firstCourse.position.replace(/undefined/g, '')
						allResult.splice(i, 1);
						i--;
					}

				}
			}
		}
		contractResult.push(firstCourse);
	}
	//将每一天内的课程进行合并
	let finallyResult = []
	contractResult = contractResult.sort(function (a, b) { return a.day - b.day })
	while (contractResult.length != 0) {
		let firstCourse = contractResult.shift();
		if (firstCourse == undefined) continue;
		let weekTag = firstCourse.day;
		for (let i = 0; contractResult[i] !== undefined && weekTag === contractResult[i].day; i++) {
			if (firstCourse.weeks[0] === contractResult[i].weeks[0] && firstCourse.name === contractResult[i].name && firstCourse.position === contractResult[i].position && firstCourse.teacher === contractResult[i].teacher) {
				firstCourse.sections.push(contractResult[i].sections[0]);
				contractResult.splice(i, 1);
				i--;
				// delete (contractResult[i])
			}
		}
		finallyResult.push(firstCourse);
	}
	//将课程的周次进行合并
	contractResult = JSON.parse(JSON.stringify(finallyResult));
	finallyResult.length = 0
	contractResult = contractResult.sort(function (a, b) { return a.day - b.day })
	while (contractResult.length != 0) {
		let firstCourse = contractResult.shift();
		if (firstCourse == undefined) continue;
		let weekTag = firstCourse.day;
		for (let i = 0; contractResult[i] !== undefined && weekTag === contractResult[i].day; i++) {
			if (pdSection(firstCourse.sections, contractResult[i].sections) && firstCourse.name === contractResult[i].name && firstCourse.position === contractResult[i].position && firstCourse.teacher === contractResult[i].teacher) {
				firstCourse.weeks.push(contractResult[i].weeks[0]);
				contractResult.splice(i, 1);
				i--;
			}
		}
		finallyResult.push(firstCourse);
	}
	console.log(finallyResult)
	return finallyResult;
}
function getWeeks(Str) {
	function range(con, tag) {
		let retWeek = []
		con.slice(0, -1).split(',').forEach(w => {
			let tt = w.split('-')
			let start = parseInt(tt[0])
			let end = parseInt(tt[tt.length - 1])
			if (tag == 1 || tag == 2) retWeek.push(...Array(end + 1 - start).fill(start).map((x, y) => x + y).filter(f => { return f % tag == 0 }))
			else retWeek.push(...Array(end + 1 - start).fill(start).map((x, y) => x + y).filter(v => { return v % 2 != 0 }))
		})
		return retWeek
	}
	Str = Str.replace(/\(|\)|\{|\}|\||第/g, "").replace(/到/g, "-")
	let reWeek = [];
	let week1 = []
	while (Str.search(/周/) != -1) {
		let index = Str.search(/周/)
		if (Str[index + 1] == '单' || Str[index + 1] == '双') {
			week1.push(Str.slice(0, index + 2).replace("周", ""));
			index += 2
		} else {
			week1.push(Str.slice(0, index + 1).replace("周", ""));
			index += 1
		}

		Str = Str.slice(index)
		index = Str.search(/\d/)
		if (index != -1) Str = Str.slice(index)
		else Str = ""

	}
	if (Str.length != 0) week1.push(Str)

	week1.forEach(v => {
		console.log(v)
		if (v.slice(-1) == "双") reWeek.push(...range(v, 2))
		else if (v.slice(-1) == "单") reWeek.push(...range(v, 3))
		else reWeek.push(...range(v + "全", 1))
	});
	return reWeek;
}
function getSections(Str) {
	Str = Str.replace(/节/g, "").split(",")
	let res = []
	Str.forEach(ss => {
		let arr = ss.split("-")
		for (let i = Number(arr[0]); i <= arr[arr.length - 1]; i++) {
			res.push({ section: i })
		}
	})
	console.log(Str, res)
	return res
}
function scheduleHtmlParser(html) {
	//除函数名外都可编辑
	//传入的参数为上一步函数获取到的html
	//可使用正则匹配
	//可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
	let jss = JSON.parse(html)
	let result = []
	let $ = cheerio.load(jss.html, { decodeEntities: false })
	let bbb = $('div[class = "tab-pane fade active in"]')
	let message = ""
	try {
		if (bbb.attr('id') == 'table1') {
			let trs = bbb.find('table tbody tr')
			trs.each(function (index, em) {
				if (index >= 2) { //跳过表头
					$(this).find('.td_wrap').each(function (__, em1) {
						let weekday = $(this).attr('id').slice(0, 1)
						$(this).find('div').each(function (index2, em2) {
							let re = { weeks: [], sections: [] }
							re.day = Number(weekday);
							re.name = $(this).find('span[class="title"]').length != 0 ? $(this).find('span[class="title"]').text() : $(this).find('u').text()//处理调课
							if (!new RegExp(/[\u4E00-\u9FA5]|[a-zA-Z0-9]/, 'g').test(re.name.slice(-1))) re.name = re.name.slice(0, -1)

							$(this).children('p').each(function (inn, em) {
								let text = $(this).find('span').attr('title')
								switch (text) {
									case '节/周':
										let tt = $(this).text();
										re.sections = getSections(tt.match(/(?<=\().*?(?=\))/)[0])
										re.weeks = getWeeks(tt.match(/(?<=节\)).*?$/)[0])
										console.log($(this).text());
										break;
									case '上课地点': re.position = $(this).text().replace(/^.*?校区\s/g, "").trim();
										break;
									case '教师': re.teacher = $(this).text().replace(/\(.*?\)/g, "").trim();
										break;
								}
							})
							result.push(re)
						})
					})
				}
			})
		}
		else if (bbb.attr('id') == 'table2') {
			let tbs = bbb.find('table tbody')
			tbs.each(function (index, em) {
				if ($(this).attr('id') != undefined) {  //跳过表头
					let re = { weeks: [], sections: [] }
					re.day = Number($(this).attr('id').replace('xq_', ""))
					let tag = true;
					$(this).children('tr').each(function (index1, em1) {
						re.weeks = []
						if (index1 > 0) {   //跳过星期列
							let tds = $(this).find('td')
							let sp_tr = null;
							if (tds.length == 2) {
								re.sections = getSections(tds.eq(0).text())
								sp_tr = tds.eq(1).find('div')
							} else {
								sp_tr = tds.eq(0).find('div')
							}
							re.name = $(this).find('span[class="title"]').length != 0 ? $(this).find('span[class="title"]').text() : $(this).find('u').text()
							if (!new RegExp(/[\u4E00-\u9FA5]|[a-zA-Z0-9]/, 'g').test(re.name.slice(-1))) re.name = re.name.slice(0, -1)
							sp_tr.find('p font').each(function (index2, em2) {
								switch ($(this).find('span').last().attr('class')) {
									case 'glyphicon glyphicon-calendar': re.weeks = getWeeks($(this).text().replace("周数：", "").trim()); break;
									case 'glyphicon glyphicon-map-marker': re.position = $(this).text().replace(/校区：|.*?校区|上课地点：/g, "").trim();
										break;
									case 'glyphicon glyphicon-user': re.teacher = $(this).text().replace(/教师：|\(.*?\)/g, "").trim();
										break;
								}
							})
							console.log(re)
							tag = false
						}
						if (tag) return;
						result.push(JSON.parse(JSON.stringify(re)))
					})
				}
			})
		}
		else {
			let data = JSON.parse(jss.html)
			data.forEach(course => {
				result.push({
					name: course.kcmc,
					position: course.cdmc,
					day: Number(course.xqj),
					weeks: getWeeks(course.zcd),
					sections: getSections(course.jc),
					teacher: course.xm

				})
			})
		}
		if (result.length == 0) message = "没有获取到课表"
		else result = resolveCourseConflicts(result)
	} catch (e) {
		message = e.message
	}
	if (message.length != 0) {
		result.length = 0
		result.push({ name: "遇到错误,可加群:628325112 或联系开发者qq 3450414733 进行反馈", teacher: "开发者-cos", position: message, day: 1, weeks: [1], sections: [{ section: 1 }, { section: 2 }] })
	}
	console.info(result)
	return { courseInfos: result, sectionTimes: jss.sj }
}
/**
 * return data format: https://open-schedule-prod.ai.xiaomi.com/docs/#/help/?id=parser
 * [{
		name: "数学", // 课程名称
		position: "教学楼1", // 上课地点
		teacher: "张三", // 教师名称
		weeks: [1, 2, 3, 4], // 周数
		day: 3, // 星期
		sections: [1, 2, 3], // 节次
	}]
 */