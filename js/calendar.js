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
            select:"",
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
        function f(t){
            t = t+"";
            return (t.length==1) && "0"+t || t;
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
            this.select = options.select;
            this.trigger = options.trigger;
            this.element = element;
            this.year = new Date().getFullYear();
            this.month = new Date().getMonth()+1;
            this.day = new Date().getDate();
            this.now = [this.year,this.month,this.day]
            this.date = [];
            this.temp = this.year;
            this.init();
        }
    Calendar.prototype = {
        init: function() {
            this.builddays()
            this.event();
        },
        event: function() {
            var that = this;
            ele = this.element;
            trigger = this.trigger;
            // view change
                $(ele).on("click",".calendar_display",function(){
                    if($(ele).hasClass("calendar_day")){
                        $(ele).toggleClass("calendar_month calendar_day");
                        that.buildmonths();
                    }
                })
            // arrow
                $(ele).on("click",".view_date .calendar_arrow span",function(){
                    if($(this).hasClass("prev")){
                        that.loaddays(0);
                    }else{
                        that.loaddays(1);
                    }
                })
                $(ele).on("click",".view_month .calendar_arrow span",function(){
                    if($(this).hasClass("prev")){
                        that.loadmonth(0);
                    }else{
                        that.loadmonth(1);
                    }
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
                    that.date.push(that.year+'-'+f(that.month)+'-'+f(parseInt($(this).html())));
                })
                $(ele).on("click",".view_month .month li",function(){
                    if($(this).attr("disabled")) return false;
                    var month = $(this).data("v");
                    that.month = month;
                    that.year = that.temp;
                    $(this).addClass('selected').siblings().removeClass("selected");
                    $(ele).toggleClass("calendar_month calendar_day")
                    that.builddays();
                });
            // open
                $(trigger).click(function(){
                    $("body").scrollTop(0).addClass("row")
                    $(ele).show()
                    $(".calendar_b").show()
                    $(window).on('touchmove', function (e) {
                        e.preventDefault();
                    });
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
                        that.options.onSelected(that.date,DateDiff)
                    }else{
                        that.options.onSelected(that.date[0])
                    }
                    $(ele).hide();
                    $("body").removeClass("row")
                    $(window).unbind('touchmove');
                })
        },
        getdays: function(){
            var olds = [],lasts = [],nows = [],news = [],selected = [],week_no = [],days = [];
            days.push(getDaysNum(this.year,this.month-1));
            days.push(getDaysNum(this.year,this.month));
            week_no.push(new Date(this.year+"-"+f(this.month)+"-"+"01").getDay());
            week_no.push(new Date(this.year+"-"+f(this.month)+"-"+f(days[1])).getDay());
            for (var j = 0; j < week_no[0] ; j++) {
                olds.unshift(days[0]-j);
            };
            for (var x = 0; x < days[1] ; x++) {
                nows.push(x+1);
            };
            for (var y = 0; y < (6-week_no[1]) ; y++) {
                news.push(y+1)
            };
            if(!olds.length && nows[0]==1){
                for (var j = 0; j < 7 ; j++) {
                    olds.unshift(days[0]-j);
                };
            }
            if((olds.length+nows.length+news.length) == 35){
                var start = news[news.length-1]<8?news[news.length-1]+1:1;
                for (var z = 0; z < 7 ; z++) {
                    news.push(start+z)
                };
            }
            if(this.year==this.now[0] && this.month==this.now[1]){
                var no = nows.indexOf(this.now[2]);
                lasts = nows.slice(0,no)
                nows = nows.slice(no,nows.length)
            }
            for (var i = 0; i < this.date.length; i++) {
                var date = this.date[i].split("-");
                if(this.year==date[0] && this.month==date[1]){
                    selected.push(nows.indexOf(parseInt(date[2])))
                }
            }
            return {olds:olds,lasts:lasts,nows:nows,news:news,selected:selected};
        },
        builddays:function(){
            var data = this.getdays();
            $(".view_date").html(evaldate({year:this.year,month:this.month,data:data}));
        },
        buildmonths:function(){
            $(".view_month").html(evalmonth({nowyear:this.temp,year:this.year,month:this.month,now:this.now}));
        },
        loaddays:function(t){
            if(!t){
                if(this.select && this.year<=this.now[0] && this.month==this.now[1]){
                    return false;
                }
                this.month-=1;
            }else{
                this.month+=1;
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
        loadmonth:function(t){
            if(!t){
                if(this.select && this.temp==this.now[0]){
                    return false;
                }
                this.temp-=1;
            }else{
                this.temp+=1;
            }
            this.buildmonths();
        }
    };
    $.fn.calendar = function(options) {
        new Calendar(this, options)
    }
}));
