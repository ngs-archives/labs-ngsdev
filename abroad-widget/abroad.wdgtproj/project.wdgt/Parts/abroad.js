Recruit.UI.key = 'a450fa593ee3f2a4';

var ABROADWidget = {
	results : false,
	templates : {},
	init : function() {
		$.each(["Dept","Places","Month","Term","Price","Order"],function(){
			new ABROAD.UI[this].Pulldown();
		});
		$("a[@rel='submit']").click(function(){
			$("form#"+$(this).attr("href").split("#").pop()).trigger("submit"); return false;
		});
		$("a[@rel='set-status']").click(function(){
			ABROADWidget.setStatus($(this).attr("href").split("#").pop()); return false;
		});
		$("form#search-form").submit(function(){
			ABROADWidget.search(); return false;
		});
		//
		$("div#navi-bottom p.hitnum em").html("<#te>");
		$("div#navi-bottom p.current span.c").html("<#cp>");
		$("div#navi-bottom p.current span.t").html("<#lp>");
		this.templates.page = $("div#navi-bottom").html().replace(/\t|\n/g,"").replace(/&gt;/g,">").replace(/&lt;/g,"<");
		this.templates.cassette = $("#cassette-template").html().replace(/\t|\n/g,"");
		$("#cassette-template").remove();
		$("div#navi-bottom").empty();
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
		"start=" + start + "&" + $( 'form#search-form' ).formSerialize();
		ScriptRunner([{"ABROADWidget.results":url}]);
		this.setStatus("loading");
	},
	setStatus : function(i) {
		var bool = false;
		$.each(["complete","error","loading","search"],function(){
			if(this!=i) $("body").removeClass(this);
			else {
				$("body").addClass(this);
				bool = true;
			}
		}) ;
		return bool;
	},
	onLoadResults : function(d) {
		var r = d.results;
		this.results = r;
		if(!d||!r||r.error) return this.error(r&&r.error&&r.error[0]&&r.error[0].message);
		else if(!this.appendCassettes(r.tour)) return false;
		//
		var page = new Recruit.UI.Page.Simple(d);
		page.paginate({
			id : "navi-bottom",
			request: function(i) { ABROADWidget.search(i); },
			template : this.templates.page
		});
		this.setStatus("complete");
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
		$("div#content").empty();
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
			$("div#content").append(cas);
		});
		$("div#content div.cassette").click(function(){
			var h = $("h2 a",this).attr("href");
			if (window.widget) widget.openURL(h);
			else window.open(h);
			return false;
		})
		//$("div#content").css("top",0);
		return true;
	}
}

$(document).ready(function(){
	ABROADWidget.init();
});
