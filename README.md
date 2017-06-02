# calendar
基于jquery和doT的日历插件，兼容pc端和移动端
可作为普通选择日期，也可作为酒店系统选择两个日期，返回两个日期和天数
使用方式
    $('.calendar').calendar({
        trigger:"#dt",//触发按钮
        select:"now",//日历模式：默认所有日期，若设置该选项，限制前面日期不可见
        type:"range",//选择模式：默认单选，若设置该选项，可选择日期段（起始和结束）
        onSelected: function (date,days) {
            console.log(date)
            console.log(days)
        }
    });
