class Clock {
	var field:TextField;
	private static var instance:Clock ;
	private static var inited:Boolean = false;
	public var addEventListener:Function;
	public var removeEventListner:Function;
	private var dispatchEvent:Function;
	
	function Clock (field:TextField) {
		this.field = field;
		mx.events.EventDispatcher.initialize(this);
		instance = this;
		inited = true;
	}
	
	public static function getInstance():Clock {
		if (!inited) {
			instance = new Clock(null);
		}
		return instance;
	}
	
	public function start() {
		setInterval(checkTime, 1000, this)
	}
	
	/**
	* SWFのロードが終わったとき
	*/
	public function complete (evt:Object):Void {
		// SWFのルートを取得、リスナ登録
		var target:MovieClip = evt.target.loadedList.contentHolder.obj;
		this.addEventListener("onSeconds", target);														
	}
	
	
	
	public function onVideoComplete(evt:Object):Void {
		trace ("video finish");
		var date:Date = new Date();
		last_check = date.getSeconds();
		delete date;
	}
	
	var last_check:Number = 1000;
	var prev_sec:Number;
	
	private function checkTime(target:Clock) :Void{
		var date:Date = new Date();
		var date_str:String = "";
		var hour:Number = date.getHours();
		var min:Number = date.getMinutes();
		var sec:Number = date.getSeconds();
		date_str = (hour>9) ? hour : "0"+hour;
		date_str += ":"+((min>9) ? min : "0"+min);
		date_str += ":"+((sec>9) ? sec : "0"+sec);
		
		target.field.text = date_str;
		if (target.prev_sec != sec) {
			target.dispatchEvent({type:"onSeconds", date:date});
		}

		if (target.last_check !=1000 && Math.abs(sec - target.last_check) > 5) {
			target.last_check =1000;
			target.dispatchEvent({type:"onSpend5Sec", date:date});
		}		
		target.prev_sec =sec;
	}
}