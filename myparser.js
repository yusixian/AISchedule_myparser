// 校验字符串长度 一个中文代表两个字符
function calcuLengthEN(obj) {
    return obj.replace(/[^\x00-\xff]/g, "aa").length;
}
//js截取字符串，中英文都能用 
//如果给定的字符串大于指定长度，截取指定长度返回，否者返回源字符串。 
function checkLength(str, len) {
    if(calcuLengthEN(str) > len) {
        let str_cut = str.substr(0, len/2-2).concat("...");
        return str_cut;
    } else return str;
}
function weekStr2IntList(week) {
  // 将全角逗号替换为半角逗号
  let reg = new RegExp("，", "g");
  week.replace(reg, ',');
  let weeks = [];

  // 以逗号为界分割字符串，遍历分割的字符串
  week.split(",").forEach(w => {
      if (w.search('-') != -1) {
          let range = w.split("-");
          let start = parseInt(range[0]);
          let end = parseInt(range[1]);
          for (let i = start; i <= end; i++) {
              if (!weeks.includes(i)) {
                  weeks.push(i);
              }
          }
      } else if (w.length != 0) {
          let v = parseInt(w);
          if (!weeks.includes(v)) {
              weeks.push(v);
          }
      }
  });
  return weeks;
}
function getSections(str) {//1-2 1、2
  let start = parseInt(str.split('-')[0])
  let startTimes = ["", "8:30", "9:20", "10:25", "11:15", "14:30", "15:20", "16:10", "17:00", "19:30", "20:05", "20:40"];
  let end = parseInt(str.split('-')[1])
  let endTimes = ["", "9:15", "10:05", "11:10", "12:00", "15:15", "16:05", "16:55", "17:45", "20:00", "20:35", "21:05"];
  let sections = []
  for (let i = start; i <= end; i++) {
      sections.push({ 
        "section": i ,
        "startTime": startTimes[i],
        "endTime": endTimes[i]
    })
  }
  return sections
}

function getTime(str) {
  let t = str.split('节)')
  let reg = new RegExp('周', 'g')
  let weekStr = t[1].replace(reg, '').split(',')
  let weeks = [] //1-3(单),4-8
  for (let i = 0; i < weekStr.length; i ++) {  //遍历数组
    let x = getWeeks(weekStr[i])
    weeks = weeks.concat(x)
  }
  return [weeks, getSections(t[0].replace('(', ''))]
}
function getListWeeks(str) {
  let reg = new RegExp('周', 'g')
  let weekStr = str.replace(reg, '').split(',')
  let weeks = [] //1-3(单),4-8
  for (let i = 0; i < weekStr.length; i ++) {  //遍历数组
    let x = getWeeks(weekStr[i])
    weeks = weeks.concat(x)
  }
  return weeks

}
function getWeeks(str) {
  
  let flag = 0
  if (str.search('单') != -1) {
      flag = 1
      str = str.replace('单', '')
  } else if (str.search('双') != -1) { 
      flag = 2
      str = str.replace('双', '')
  }
  let weeks = weekStr2IntList(str)
  weeks = weeks.filter((v) => {
      if (flag === 1) {
          return v % 2 === 1
      } else if (flag === 2) {
          return v % 2 === 0
      }
      return v
  })
  return weeks
}

// 解析列表模式
function parseList(html) {
  let result = []
  let temp_sections
  const $ = cheerio.load(html, { decodeEntities: false });
  $('#kblist_table').find('tbody').each(function(weekday) {
      if (weekday > 0) {
          $(this).find('tr').each(function(index) {
              if (index > 0) {//忽略无用信息
                  let course = {} // 课程信息
                  $(this).find('td').each(function(i) {
                      if (i == 0 && $(this).find('.festival')[0] != undefined) {
                          course.sections = getSections($(this).text())
                          temp_sections = course.sections
                          console.log(course);
                      } else if(i == 0) {
                          course.sections = temp_sections
                          course.name = checkLength($(this).find('.title').text(), 39)
                          let info = [] 
                          $(this).find('p font').each(function() {
                              let text = $(this).text().trim()
                              if (text.search('上课地点') != -1) {
                                  text = text.replace('上课地点：', '')
                              }// 上课地点：文科组团楼127
                              info.push(text.split('：')[1])
                          })
                          course.weeks = getListWeeks(info[0])
                          course.teacher = info[2]
                          course.position = checkLength(info[1].split(' ')[1], 18);
                          course.day = weekday
                          console.log(course)
                      } else {
                          course.name = checkLength($(this).find('.title').text(), 39)
                          let info = [] 
                          $(this).find('p font').each(function() {
                              let text = $(this).text().trim()
                              if (text.search('上课地点') != -1) {
                                  text = text.replace('上课地点：', '')
                              }// 上课地点：文科组团楼127
                              info.push(text.split('：')[1])
                          })
                          course.weeks = getListWeeks(info[0])
                          course.teacher = info[2]
                          course.position = checkLength(info[1].split(' ')[1], 18);
                          course.day = weekday
                          console.log(course)
                      }
                  })
                  result.push(course)
              }
          })
      }
  })
  console.log(result)
  return result
}

// 解析表格模式
function parseTable(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  let result = []
  $('#kbgrid_table_0').find('td').each(function() {
      if ($(this).hasClass('td_wrap') && $(this).text().trim() !== '') {
          let info = []
          let weekday = parseInt($(this).attr('id').split('-')[0])
          $(this).find('font').each(function() {
              let text = $(this).text().trim()
              if (text !== '') {
                  info.push(text)
              }
          })
          let hasNext = true
          let index = 0
          while (hasNext) {
              let course = {}
              course.name = checkLength(info[index], 39)
              let [weeks, sections] = getTime(info[index + 1])
              course.position = checkLength(info[index + 2].split(' ')[1], 18)
              course.teacher = info[index + 3]              
              course.day = weekday
              course.weeks = weeks
              course.sections = sections
              result.push(course)
              console.log(course)
              if (info[index + 11] != undefined) {
                  index += 11
              } else  {
                  hasNext = false
              }
          }
      }
  })
  return result
}

function scheduleHtmlParser(html) {
  let result = []

  if ($('#type').text() === 'list') {
      result = parseList(html)
  } else {
      result = parseTable(html)
  }

  console.log(result.length)
  sections = [ 
      {
        "section": 1,
        "startTime": "08:30",
        "endTime": "09:15"
      },
      {
        "section": 2,
        "startTime": "9:20",
        "endTime": "10:05"
      },
      {
        "section": 3,
        "startTime": "10:25",
        "endTime": "11:10"
      },
      {
        "section": 4,
        "startTime": "11:15",
        "endTime": "12:30"
      },
      {
        "section": 5,
        "startTime": "14:30",
        "endTime": "15:15"
      },
      {
        "section": 6,
        "startTime": "15:20",
        "endTime": "16:05"
      },
      {
        "section": 7,
        "startTime": "16:10",
        "endTime": "16:55"
      },
      {
        "section": 8,
        "startTime": "17:00",
        "endTime": "17:45"
      },
      {
        "section": 9,
        "startTime": "19:05",
        "endTime": "19:45"
      },
      {
        "section": 10,
        "startTime": "19:50",
        "endTime": "20:35"
      },
      {
        "section": 11,
        "startTime": "20:35",
        "endTime": "21:00"
      }
    ];
  return { courseInfos: result, sectionTimes:sections}
}