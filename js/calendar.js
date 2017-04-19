/**
 *
 * @authors elena
 * @date    2017-04-18
 * https://github.com/elena/Calendar
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('calendar', ['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(root.jQuery);
    }
}(this, function($) {
    // default config
        var defaults = {
            type:"",
            trigger: '',
            onSelected: function(date, days) {
                // body...
            }
        };
    // function
        function GetDateDiff(startDate,endDate)  {
            var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime(); 
            var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime(); 
            var dates = Math.abs((startTime - endTime))/(1000*60*60*24);     
            return  dates; 
        }
        function isLeap(y) {
            return (y % 100 !== 0 && y % 4 === 0) || (y % 400 === 0);
        }
        function getDaysNum(y, m) {
            var num = 31;
            switch (m) {
                case 2:
                    num = isLeap(y) ? 29 : 28;
                    break;
                case 4:
                case 6:
                case 9:
                case 11:
                    num = 30;
                    break;
            }
            return num;
        }
        function Calendar(element, options) {
            this.options = $.extend({}, defaults, options);
            this.type = options.type;
            this.trigger = options.trigger;
            this.element = element;
            this.year = new Date().getFullYear();
            this.month = new Date().getMonth()+1;
            this.day = new Date().getDate();
            this.now = [this.year,this.month,this.day]
            this.date = [];
            this.init();
        }
    Calendar.prototype = {
        render: function(){
            $(".calendar").html(evalcalendar({year:this.year,month:this.month}));
            this.builddays()
        },
        getdata: function(days,week_no){
            var data = [];
            for (var j = 0; j < week_no[0] ; j++) {
                data.unshift(days[0]-j)
            };
            for (var x = 0; x < days[1] ; x++) {
                data.push(x+1)
            };
            for (var y = 0; y < (6-week_no[1]) ; y++) {
                data.push(y+1)
            };
            if(data.length == 35){
                var start = data[data.length-1]<8?data[data.length-1]:1;
                for (var z = 0; z < 7 ; z++) {
                    data.push(start+z)
                };
            }
            return data;
        },
        getday: function(y,m){
            var week_no = [],days = [],data = [],year = this.year,month = this.month;
            days.push(getDaysNum(year,month-1));
            days.push(getDaysNum(year,month));
            week_no.push(new Date(year+"-"+month+"-"+"1").getDay())
            week_no.push(new Date(year+"-"+month+"-"+days[1]).getDay())
            var data = this.getdata(days,week_no);
            return data;
        },
        loaddata:function(obj,n){
            if($(obj).hasClass("prev")){
                this[n]-=1;
            }else{
                this[n]+=1;
            }
            if(this.month>12){
                this.month = 1;
                this.year += 1;
            }
            if(this.month<1){
                this.month = 12;
                this.year -= 1;
            }
            this.builddays()
        },
        builddays:function(){
            var data = this.getday(this.year,this.month);
            $(".days").html(evaldate(data));
            $(".year").html(this.year)
            if(this.year==this.now[0] && this.month==this.now[1]){
                $(".days li").eq(data.indexOf(this.day)).addClass("now")
            }
            for (var i = 0; i < this.date.length; i++) {
                var date = this.date[i].split("-");
                if(this.year==date[0] && this.month==date[1]){
                    if(parseInt(date[2])>14){
                        $(".days li").eq(data.lastIndexOf(parseInt(date[2]))).addClass("selected")
                    }else{
                        $(".days li").eq(data.indexOf(parseInt(date[2]))).addClass("selected")
                    }
                }
            }
        },
        event: function() {
            var that = this;
            ele = this.element;
            trigger = this.trigger;
            // view change
                $(ele).on("click",".calendar_display",function(){
                    $(ele).toggleClass("calendar_month").toggleClass("calendar_day")
                })
            // arrow
                $(ele).on("click",".view_date .calendar_arrow span",function(){
                    that.loaddata(this,"month");
                    $(".m").html(that.month)
                })
                $(ele).on("click",".view_month .calendar_arrow span",function(){
                    that.loaddata(this,"year");
                })
            // selected
                $(ele).on("click",".view_date .days li",function(){
                    if($(this).attr("disabled")) return false;
                    if(that.type && that.date.length==1){
                        var date = that.date[0].split("-");
                    }
                    if(date && (date[1]>that.month || (date[1]==that.month && date[2]>parseInt($(this).html()))) || !that.type || that.date.length>=2){
                        $(ele).find(".view_date .days li").removeClass("selected")
                        that.date = [];
                    }
                    $(this).addClass('selected');
                    that.date.push(that.year+'-'+that.month+'-'+parseInt($(this).html()));
                })
                $(ele).on("click",".view_month .month li",function(){
                    that.month = $(this).data("v");
                    $(this).addClass('selected').siblings().removeClass("selected");
                    $(".m").html(that.month)
                    that.builddays();
                    $(ele).toggleClass("calendar_month").toggleClass("calendar_day")
                });
            // open
                $(trigger).click(function(){
                    $(ele).show()
                })
            // close
                $(ele).on("click",".closeBtn",function(){
                    if(!that.date.length){
                        alert("请选择日期");
                        return false;
                    }
                    if(that.type && that.date.length<2){
                        alert("请离店日期");
                        return false;
                    }
                    if(that.type){
                        var DateDiff = GetDateDiff(that.date[0],that.date[1])
                        $(ele).hide()
                        that.options.onSelected(that.date,DateDiff)
                    }else{
                        that.options.onSelected(that.date[0])
                    }
                })
        },
        init: function() {
            this.render();
            this.event();
        }
    };
    $.fn.calendar = function(options) {
        new Calendar(this, options)
    }
}));
