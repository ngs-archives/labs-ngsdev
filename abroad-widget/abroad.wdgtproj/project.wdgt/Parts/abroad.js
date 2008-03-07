Recruit.UI.key = 'ef4393b09d77dbc2';

var ABROADWidget = {
	results : false,
	templates : {},
	elements : {},
	init : function() {
		$.each(["Dept","Places","Month","Term","Price","Order"],function(){ new ABROAD.UI[this].Pulldown(); });
		$("a[@rel='submit']").click(function(){ $("form#"+$(this).attr("href").split("#").pop()).trigger("submit"); return false; });
		$("a[@rel='reset']").click(function(){ $("form#"+$(this).attr("href").split("#").pop()).each(function(){ this.reset(); }); return false; });
		$("a[@rel='external']").click(function(){ return ABROADWidget.getURL($(this).attr("href")); });
		$("a[@rel='set-status']").click(function(){ ABROADWidget.setStatus($(this).attr("href").split("#").pop()); return false; });
		$("input[@type='text']").click(function(){ this.select(); })
		$("form#search-form").submit(function(){ ABROADWidget.search(); return false; });
		$("div#error").click(function(){ ABROADWidget.setStatus("search"); });
		$("form#search-form select,form#search-form input[@type='text']").change(function(){
			var k = $(this).attr("name");
			if(k) ABROADWidget.pref.set(k,$(this).val());
		});
		$("form#search-form select,form#search-form input[@type='text']").each(function(){
			$(this).val(ABROADWidget.pref.get($(this).attr("name")));
		});
		if(window.widget) {
			this.elements.scrollbar = CreateScrollArea("results", { hasVerticalScrollbar: true, scrollbarDivSize: 15, autoHideScrollbars: true, scrollbarMargin: 2, spacing: 4 });
			var opts = [], act = $("select#ab-order-sel")[0].selectedIndex;
			$("select#ab-order-sel option").each(function(i){
				opts.push("['"+$(this).text()+"','"+$(this).val()+"'"+(i==act?",true":"")+"]");
			});
			opts = "["+opts.join(",")+"]";
			$("select#ab-order-sel").remove();
			this.elements.sortorder = CreatePopupButton("sort-order-popup", {
				options: opts, rightImageWidth: 16, leftImageWidth: 7
			});
			$(this.elements.sortorder.select).change(function(e){ ABROADWidget.changeSort($(this).val()); });
			this.elements.infobutton = CreateInfoButton('info-button', {
				onclick : function(){ ABROADWidget.setStatus("back"); },
				foregroundStyle: 'white', frontID: 'front', backgroundStyle: 'white'
			});
			this.elements.donebutton = CreateGlassButton("done-button", {
				onclick: function(){ ABROADWidget.setStatus("front"); },
				text: "OK"
			});
		} else $("body").addClass("browser");
		//
		$("div#page-navi p.current span.c").html("<#cp>");
		$("div#page-navi p.current span.t").html("<#lp>");
		this.templates.page = $("div#page-navi").html().replace(/\t|\n/g,"").replace(/&gt;/g,">").replace(/&lt;/g,"<");
		this.templates.cassette = $("#cassette-template").html().replace(/\t|\n/g,"");
		$("#cassette-template").remove();
		$("div#page-navi").empty();
		this.setStatus("search");
	},
	error : function(msg) {
		msg = msg ?msg: "不明なエラー";
		$("div#error p.message").html("<em>"+msg+"<\/em>");
		this.setStatus("error");
		return false;
	},
	search : function(start) {
		start = start ? start : 1;
		var url = "http:\/\/webservice.recruit.co.jp\/ab-road\/tour\/v1\/?" + 
		"key=" + Recruit.UI.key + "&format=jsonp&callback=ABROADWidget.onLoadResults&" +
		"start=" + start + "&" + $( 'form#search-form' ).formSerialize()+
		"&rnd="+Math.ceil(Math.random()*10000000).toString();
		delete this.results;
		ScriptRunner([{"ABROADWidget.results":url}]);
		this.setStatus("loading");
	},
	setStatus : function(i) {
		var bool = false, reverse = false;
		if(i=="back"&&!$("body.back").size()) reverse = "ToBack";
		else if(i!="back"&&$("body.back").size()) {
			reverse = "ToFront";
			i = this._status;
		}
		if(window.widget&&reverse) widget.prepareForTransition(reverse);
		$.each(["complete","error","loading","search","back"],function(){
			if(this!=i) $("body").removeClass(this);
			else {
				$("body").addClass(this);
				bool = true;
			}
		}) ;
		switch(i) {
			case "loading":
			case "error":
				$("div#"+i).css("opacity","0.0");
				$("div#"+i).animate({opacity:1},"fast");
				$("p#info-button").addClass("hidden");
				break;
			case "search":
				$("div#results").addClass("hidden");
				$("div#search").removeClass("hidden");
				$("p#info-button").removeClass("hidden");
				break;
			case "complete":
				$("div#results").removeClass("hidden");
				$("div#search").addClass("hidden");
				$("p#info-button").removeClass("hidden");
				break;
				
		}
		if(window.widget&&reverse) setTimeout ("widget.performTransition();", 0);
		if(bool&&i!="back") this._status = i;
		return bool;
	},
	onLoadResults : function(d) {
		var r = d.results;
		this.results = r;
		if(!d||!r||r.error) return this.error(r&&r.error&&r.error[0]&&r.error[0].message);
		else if(!this.appendCassettes(r.tour)) return false;
		//
		var page = new Recruit.UI.Page.Simple(d);
		$("div#navi-top p.hitnum em").html(page.data_page._total_entries);
		page.paginate({
			id : "page-navi",
			request: function(i) { ABROADWidget.search(i); },
			template : this.templates.page
		});
		$("div#results").addClass("hidden");
		setTimeout(function(){
			ABROADWidget.setStatus("complete");
			if($("div#cassettes").height()>$("div#results").height()) $("div#results").addClass("overflow");
			else $("div#results").removeClass("overflow");
			if(ABROADWidget.elements.scrollbar) ABROADWidget.elements.scrollbar.refresh();
		},99);
		return true;
	},
	appendCassettes : function(tours) {
		if(!tours||!tours.length) return this.error("検索結果が1件もありません");
		var ht = "";
		var tmpl = this.templates.cassette;
		function fmturi(s,d) {
			var q = s.split("?").pop().split("&"), p = "", o = {};
			$.each(q,function(){
				var a = this.split("=");
				o[a[0]] = a[1];
				if(!a[0].match(/tourcode|vos|site_code|root_type/))	p+=a[0]+"-"+a[1]+"\/";
			});
			switch(d) {
				case "NRT": case "HND": case "TYO": d = "TYO"; break;
				case "OSA": case "ITM": case "KIX": d = "OSA"; break;
				case "NGO": d = "NGO"; break;
				default : d = "999"; break;
			}
			return "http:\/\/www.ab-road.net\/tour\/detail\/"+d+"\/"+o.tourcode+"\/s01rWG\/"+p;
		}
		function fmtnum(x) {
			var s = "" + x;
			var p = s.indexOf(".");
			if (p < 0) p = s.length;
			var r = s.substring(p, s.length);
			for (var i = 0; i < p; i++) {
				var c = s.substring(p - 1 - i, p - 1 - i + 1);
				if (c < "0" || c > "9") { r = s.substring(0, p - i) + r; break; }
				if (i > 0 && i % 3 == 0) r = "," + r;
				r = c + r;
			}
			return r;
		}
		$("div#content div#cassettes").remove();
		var cassettes = $("<div id=\"cassettes\"><\/div>")
		$.each(tours,function(){
			var l = fmturi(this.urls.pc,this.dept_city.code);
			var t = "<div class=\"cassette\">"+tmpl+"<\/div>";
			t = t.replace(/__title__/g,this.title);
			t = t.replace(/__term__/g,this.term);
			t = t.replace(/__price_min__/g,fmtnum(this.price.min/10000));
			t = t.replace(/__price_max__/g,fmtnum(this.price.max/10000));
			t = t.replace(/__city_summary__/g,this.city_summary);
			t = t.replace(/#cassette-template/,l);
			var cas = $(t);
			if(this.price.min==this.price.max) $("p.price span.min,p.price span.glue",cas).remove();
			cassettes.append(cas);
		});
		$("div#content").append(cassettes);
		$("div#cassettes div.cassette").click(function(){
			return ABROADWidget.getURL($("h2 a",this).attr("href"));
		});
		return true;
	},
	getURL : function(h) {
			if (window.widget) widget.openURL(h);
			else window.open(h);
			return false;
	},
	changeSort : function(h) {
		var ipt = $("form#search-form input[@name='order']");
		if(ipt.val()==h) return false;
		ipt.val(h);
		this.search();
		return false;
	},
	pref : {
		set : function(k,v) {
			if(k&&window.widget) widget.setPreferenceForKey(v, createInstancePreferenceKey(k));
		},
		get : function(k) {
			if(!window.widget) return "";
			var v = k ? widget.preferenceForKey(createInstancePreferenceKey(k)) : "";
			return v?v:"";
		}
	}
}

$(document).ready(function(){
	ABROADWidget.init();
});
