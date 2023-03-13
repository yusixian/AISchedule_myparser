/**
 * 时间配置函数，此为入口函数，不要改动函数名
 */
 async function scheduleTimer({
    providerRes,
    parserRes
  } = {}) {
    // 返回时间配置JSON，所有项都为可选项，如果不进行时间配置，请返回空对象
    return {
      totalWeek: 20, // 总周数：[1, 30]之间的整数
      startSemester: '', // 开学时间：时间戳，13位长度字符串，推荐用代码生成
      startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
      showWeekend: true, // 是否显示周末
      forenoon: 4, // 上午课程节数：[1, 10]之间的整数
      afternoon: 4, // 下午课程节数：[0, 10]之间的整数
      night: 3, // 晚间课程节数：[0, 10]之间的整数
      sections: [ 
        {
          section: 1,
          startTime: "08:30",
          endTime: "09:15"
        },
        {
          section: 2,
          startTime: "9:20",
          endTime: "10:05"
        },
        {
          section: 3,
          startTime: "10:25",
          endTime: "11:10"
        },
        {
          section: 4,
          startTime: "11:15",
          endTime: "12:30"
        },
        {
          section: 5,
          startTime: "14:30",
          endTime: "15:15"
        },
        {
          section: 6,
          startTime: "15:20",
          endTime: "16:05"
        },
        {
          section: 7,
          startTime: "16:10",
          endTime: "16:55"
        },
        {
          section: 8,
          startTime: "17:00",
          endTime: "17:45"
        },
        {
          section: 9,
          startTime: "19:05",
          endTime: "19:45"
        },
        {
          section: 10,
          startTime: "19:50",
          endTime: "20:35"
        },
        {
          section: 11,
          startTime: "20:35",
          endTime: "21:00"
        }
      ], // 课程时间表，注意：总长度要和上边配置的节数加和对齐
    }
    // PS: 夏令时什么的还是让用户在夏令时的时候重新导入一遍吧，在这个函数里边适配吧！奥里给！————不愿意透露姓名的嘤某人
  }