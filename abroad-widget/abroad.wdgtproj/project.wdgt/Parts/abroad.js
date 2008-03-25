Recruit.UI.key = 'ef4393b09d77dbc2';

var ABROADWidget = {
	results : false,
	templates : {},
	elements : {},
	update : null,
	version : "1.0.1",
	init : function() {
		var gv = function(i) { return ABROADWidget.pref.get(i); }
		var pd = {};
		$.each(["Dept","Month","Order"],function(){
			var i = this.toLowerCase();
			if(i=="month") i="ym";
			pd[i] = new ABROAD.UI[this].Pulldown({ val:gv(i) });
		});
		$.each(["Term","Price"],function(){
			var i = this.toLowerCase();
			pd[i] = new ABROAD.UI[this].Pulldown({
				min : { val:gv(i+"_min") },
				max : { val:gv(i+"_max") }
			});
		});
		$("a[@href='http://www.ab-road.net/']").append(this.getBeacon());
		$("a[@href='http://www.ab-road.net/']").attr("href",this.vcURL("http:\/\/www.ab-road.net\/"));
		pd.places = new ABROAD.UI.Places.Pulldown({
			area : { val:gv("area"), first_opt_text:getLocalizedString("select_area") },
			country : { val:gv("country"), first_opt_text:getLocalizedString("select_country") },
			city : { val:gv("city"), first_opt_text:getLocalizedString("select_city") }
		});
		this.elements.pulldown = pd;
		$("form#search-form input").each(function(){
			$(this).val(ABROADWidget.pref.get($(this).attr("name")));
		});
		this.elements.searchform = { input : $("form#search-form select,form#search-form input[@type='text']") };
		this.elements.searchform.input.change(function(){
			ABROADWidget.pref.remember();
		});
		$("a[@rel='submit']").click(function(){ $("form#"+$(this).attr("href").split("#").pop()).trigger("submit"); return false; });
		$("a[@rel='reset']").click(function(){
			$("form#"+$(this).attr("href").split("#").pop()).each(function(){ this.reset(); }); return false;
			ABROADWidget.pref.remember();
		});
		$("a[@rel='external']").click(function(){ return ABROADWidget.getURL($(this).attr("href")); });
		$("a[@rel='set-status']").click(function(){ ABROADWidget.setStatus($(this).attr("href").split("#").pop()); return false; });
		$("input[@type='text']").click(function(){ this.select(); })
		$("form#search-form").submit(function(){ ABROADWidget.search(); return false; });
		$("div#error").click(function(){ ABROADWidget.setStatus("search"); });
		if(window.widget) {
			this.elements.scrollarea = CreateScrollArea("results", {
				hasVerticalScrollbar:true, scrollbarDivSize:15,
				autoHideScrollbars:true, scrollbarMargin:2, spacing:4
			});
			this.elements.scrollbar = this.elements.scrollarea._scrollbars[0];
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
				foregroundStyle:"white", frontID:"front", backgroundStyle:"white"
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
		if(this.checkUpdate()) return this.confirmUpdate();
		else return this.setStatus("search");
	},
	checkUpdate : function() {
		var cversion = this.version.split(".").join("");
		if(cversion.length<=2) cversion = cversion+"0";
		cversion = parseInt(cversion);
		var uversion = this.update&&this.update.version?this.update.version.split(".").join(""):"";
		if(uversion.length<=2) uversion = uversion+"0";
		uversion = parseInt(uversion);
		return uversion>cversion;
	},
	confirmUpdate : function(){
		this.confirm(getLocalizedString("confirm_update"),function(){
			ABROADWidget.getURL(ABROADWidget.update.download);
			ABROADWidget.setStatus("search");
		});
	},
	confirm : function(msg,callback_yes,callback_no) {
		callback_yes = callback_yes ? callback_yes : function() { return false; }
		callback_no = callback_no ? callback_no : function() { ABROADWidget.setStatus("search"); return false; }
		$("#confirm ul.buttons li a").unbind("click");
		$("#confirm ul.buttons li.yes a").click(callback_yes);
		$("#confirm ul.buttons li.no a").click(callback_no);
		msg = msg ? msg : "";
		$("div#confirm p.message").html("<em>"+msg+"<\/em>");
		this.setStatus("confirm");
		return false;
	},
	error : function(msg) {
		msg = msg ?msg: getLocalizedString("error_unknown");
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
		$.each(["complete","confirm","error","loading","search","back"],function(){
			if(this!=i) $("body").removeClass(this);
			else {
				$("body").addClass(this);
				bool = true;
			}
		}) ;
		switch(i) {
			case "loading":
			case "error":
			case "confirm":
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
		var sa = this.elements.scrollarea;
		var sb = this.elements.scrollbar;
		this.setStatus("complete");
		if(sa) {
			sa.refresh();
			sa.verticalScrollTo(0);
		}
		if((sb&&!sb.hidden)||$("div#cassettes").height()>$("div#results").height())
			$("div#results").addClass("overflow");
		else
			$("div#results").removeClass("overflow");
		return true;
	},
	appendCassettes : function(tours) {
		if(!tours||!tours.length) return this.error(getLocalizedString("error_noresult"));
		var ht = "";
		var tmpl = this.templates.cassette;
		var d_month = $("div#search select[@name='ym']").val()
		d_month = d_month&&d_month.length==6?parseInt(d_month.substr(-2)):"";
		function fmturi(s,d) {
			var q = s.split("?").pop().split("&"), p = "", o = {};
			$.each(q,function(){
				var a = this.split("=");
				o[a[0]] = a[1];
				if(!a[0].match(/tourcode|vos|site_code|root_type/))	p+=a[0]+"-"+a[1]+"\/";
			});
			if(!o.d_month&&d_month) p += "d_month-"+d_month+"\/";
			switch(d) {
				case "NRT": case "HND": case "TYO": d = "TYO"; break;
				case "OSA": case "ITM": case "KIX": d = "OSA"; break;
				case "NGO": d = "NGO"; break;
				default : d = "999"; break;
			}
			return ABROADWidget.vcURL("http:\/\/www.ab-road.net\/tour\/detail\/"+d+"\/"+o.tourcode+"\/s01rWG\/"+p+"?vos=nabrvccp07110201");
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
			$("a",cas).append(ABROADWidget.getBeacon());
			cassettes.append(cas);
		});
		cassettes.append("<div class=\"dummy\"><\/div>");
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
		this.pref.set("order",h);
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
		},
		remember : function() {
			var ipt = ABROADWidget.elements.searchform.input;
			setTimeout(function(){
				ipt.each(function(){
					var k = $(this).attr("name");
					if(k) ABROADWidget.pref.set(k,$(this).val());
				})
			},99);
		}
	},
	getBeacon : function() {
		return "<img src=\"http:\/\/ad.jp.ap.valuecommerce.com\/servlet\/gifbanner?sid=2462325&pid=876800001\" class=\"beacon\" style=\"position:absolute; top:-9999px; left:-9999px;\" \/>";
	},
	vcURL : function(u) {
		return "http://ck.jp.ap.valuecommerce.com/servlet/referral?sid=2462325&pid=876800001&vc_url="+encodeURIComponent(u);
	}
}

$(document).ready(function(){
	ABROADWidget.init();
});
