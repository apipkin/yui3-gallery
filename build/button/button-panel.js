YUI.add('button-panel', function(Y) {

var LANG = Y.Lang,
    PANEL_NODE = 'panelNode',
    PANEL_CONTENT = 'panelContent',
    VISIBLE = 'visible',
    PANEL_VISIBLE = 'panelVisible',
    PANEL_OFFSET = 'panelOffset',
    VISIBLE_CLASS = null,
    PanelPlugin = null;
    
PanelPlugin = Y.Base.create('button-plugin-panel', Y.Plugin.Base, [], {
    
    _panelNode : null,
    
    _host : null,
    
    initializer : function(){
        this._host = this.get('host');
        VISIBLE_CLASS = this._host._className + '-panel-' + VISIBLE;
        this.afterHostMethod('render', this._render, this);
        this.afterHostEvent('press', this.toggleVisible, this);
    },
    
    _render : function(){
        this._renderUI();
        this._bindUI();
        this._syncUI();
    },
    
    _renderUI : function(){
        var panel = Y.Node.create('<div class="' + this._host._className + '-panel">'),
            panelOffset = this.get(PANEL_OFFSET),
            bb = this._host.get('boundingBox');
        
        panel.setStyle('position', 'absolute');
        panel.setY( bb.getY() + bb.get('offsetHeight') + panelOffset[1] );
        panel.setX( bb.getX() + panelOffset[0] );
        
        panel.setContent(this.get(PANEL_CONTENT));
        
        bb.insert(panel, 'after');
        
        this.set(PANEL_NODE, panel);
        
        this._panelNode = panel;
    },
    
    _bindUI : function() {
        this.after(PANEL_VISIBLE + 'Change', this._visibilityChange, this);
        this.after(PANEL_CONTENT + 'Change', this._contentChange, this);
        this._panelNode.on('click', function(e){
            this.set('panelVisible', false);
        }, this);
    },
    
    _syncUI : function() {
        this._updateVisibility(this.get(PANEL_VISIBLE));
    },
    
    toggleVisible : function() {
        this.set(PANEL_VISIBLE, !this.get(PANEL_VISIBLE));
    },
    
    _visibilityChange : function(e) {
        this._updateVisibility(e.newVal);
    },
    
    _updateVisibility : function(value){
        
        value = LANG.isBoolean(value) ? value : false;
        
        if ( value ) {
            this._showPanel();
        } else {
            this._hidePanel();
        }
    },
    
    _showPanel : function(){
        this._panelNode.addClass(VISIBLE_CLASS);
    },
    
    _hidePanel : function(){
        this._panelNode.removeClass(VISIBLE_CLASS);
    },
    
    _contentChange : function(e) {
        this._panelNode.setContent(e.newVal);
    }
    
}, {
    
    NS : 'pnl',
    
    ATTRS : {
        panelNode : {
            value : null
        },
        panelContent : {
            value : ''
        },
        panelVisible : {
            value : false
        },
        panelOffset : {
            value : [0,0]
        }
    }
    
});
Y.namespace('Button.Plugin').Panel = PanelPlugin;



/** Button Panel **/
function Panel(){
    Panel.superclass.constructor.apply(this, arguments);
}

Y.extend(Panel, Y.Button.Advanced, {
    
    initializer : function(config) {
        this.plug(PanelPlugin, config);
    },
    
    toggleVisible : function() {
        if (this.hasPlugin('pnl')) {
            this.pnl.toggleVisible();
        }
    },
    
    _panelNodeSetter : function(val){
        if (this.hasPlugin('pnl')) {
            return this.pnl.set(PANEL_NODE, val);
        }
        return val;
    },
    
    _panelNodeGetter : function(){
        if (this.hasPlugin('pnl')) {
            return this.pnl.get(PANEL_NODE);
        }
        return val;
    },
    
    _panelContentSetter : function(val){
        if (this.hasPlugin('pnl')) {
            return this.pnl.set(PANEL_CONTENT, val);
        }
        return val;
    },
    
    _panelContentGetter : function(){
        if (this.hasPlugin('pnl')) {
            return this.pnl.get(PANEL_CONTENT);
        }
        return val;
    },
    
    _panelVisibleSetter : function(val){
        if (this.hasPlugin('pnl')) {
            return this.pnl.set(PANEL_NODE, val);
        }
        return val;
    },
    
    _panelVisibleGetter : function(){
        if (this.hasPlugin('pnl')) {
            return this.pnl.get(PANEL_NODE);
        }
        return val;
    },
    
    _panelOfsetSetter : function(val){
        if (this.hasPlugin('pnl')) {
            return this.pnl.set(PANEL_OFFSET, val);
        }
        return val;
    },
    
    _panelOffsetGetter : function(){
        if (this.hasPlugin('pnl')) {
            return this.pnl.get(PANEL_OFFSET);
        }
        return val;
    }

}, {
    NAME : 'button',
    
    ATTRS : {
        panelNode : {
            setter : '_panelNodeSetter',
            getter : '_panelNodeGetter'
        },
        panelContent : {
            setter : '_panelContentSetter',
            getter : '_panelContentGetter'
        },
        panelVisible : {
            setter : '_panelVisibleSetter',
            getter : '_panelVisibleGetter'
        },
        
        type : {
            value : 'panel'
        },
        
        panelOffset : {
            setter : '_panelOffsetSetter',
            getter : '_panelOffsetGetter'
        }
    }
});

Y.namespace('Button').Panel = Panel;


}, '@VERSION@' ,{requires:['button-advanced','plugin','base-build']});
