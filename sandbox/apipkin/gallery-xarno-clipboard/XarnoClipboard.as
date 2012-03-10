package {
	import flash.display.MovieClip;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.external.ExternalInterface;
	import flash.system.System;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.text.TextField;
	import com.yahoo.util.YUIBridge;

public class XarnoClipboard extends MovieClip
	{
		protected var _button:Sprite;
		protected var _txt:TextField;
		protected var _buttonHand:Boolean = true;
		protected var _buttonColor:uint = 0x0000ff;
		protected var _buttonDisplay:Boolean = true;
		protected var _yuiBridge:YUIBridge;
		
		public function XarnoClipboard():void
		{
			if (stage) {
				this._init();
			} else {
				this.addEventListener(Event.ADDED_TO_STAGE, _init);
			}
		}
		
		protected function _init(e:Event = null):void
		{
			_log('_init');
			
			if (e !== null) {
				this.removeEventListener(Event.ADDED_TO_STAGE, _init);
			}
			
			this._addInterface();
			
			stage.align = StageAlign.TOP_LEFT;
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.addEventListener(Event.RESIZE, _resize);
			
			this._makeButton();
			this._makeInput();
			
		}
		
		protected function _addInterface():void
		{
			_log('_addInterface');
			
			this._yuiBridge = new YUIBridge(this.stage);
			this._yuiBridge.addCallbacks( { 
				'setDebug' : this._setDisplay,
				'setText': this._setText, 
				'showHand': this._setButtonHand
			} );
		}
		
		protected function _resize(e:Event):void 
		{
			_log('_resize');
			if (this._button) {
				this._resizeButton();
			}
		}
		
		protected function _drawButton():void
		{
			_log('_drawButton');
			var opacity = this._buttonDisplay ? 0.5 : 0;
			this._button.graphics.clear();
			this._button.graphics.beginFill(this._buttonColor, opacity);
			this._button.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
			this._button.graphics.endFill();
		}
		
		protected function _setButtonHand(bool:Boolean):void
		{
			_log('_setButtonHand');
			this._buttonHand = bool;
			this._button.useHandCursor = bool;
		}
		
		protected function _setDisplay(bool:Boolean):void
		{
			_log('_setDisplay');
			this._buttonDisplay = bool;
			this._drawButton();
		}
		
		protected function _resizeButton():void
		{
			_log('_resizeButton');
			this._button.x = 0;
			this._button.y = 0;
			this._button.width = stage.stageWidth;
			this._button.height = stage.stageHeight;
		}
		
		protected function _makeButton():void
		{
			_log('_makeButton');
			this._button = new Sprite();
			this._button.buttonMode = true;
			this._button.useHandCursor = this._buttonHand;
			this._drawButton();
			this._button.addEventListener(MouseEvent.CLICK, _copy);
			addChild(this._button);
			this._resizeButton();
		}
		
		protected function _makeInput():void
		{
			_log('_makeInput');
			this._txt = new TextField();
			this._txt.visible = false;
			addChild(this._txt);
			this._txt.text = 'my copy text';
		}
		
		protected function _setText(text:String):void
		{
			_log('_setText');
			this._txt.text = text;
		}
		
		protected function _setClipboard(text:String):void
		{
			System.setClipboard(text);
		}
		
		protected function _copy(e:MouseEvent):void
		{
			_log('_copy');
			this._setClipboard(this._txt.text);
			this._yuiBridge.sendEvent( { type:'copy', payload:this._txt.text } );
		}
		
		protected function _log(txt:String) {
			trace(txt);
		}
	}
}