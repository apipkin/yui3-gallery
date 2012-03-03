YUI.add('button-toggle', function(Y) {

var LANG = Y.Lang,
    DESELECTED_CALLBACK = 'deselectedCallback',
    SELECTED = 'selected',
    TogglePlugin = null;

/** Button Toggle Plugin **/
TogglePlugin = Y.Base.create('button-plugin-toggle', Y.Plugin.Base, [], {
    
    _host : null,
    
    initializer : function(){
        this._host = this.get('host');
        this.beforeHostMethod("_defPressFn", this._defPressFn);
        this.after(SELECTED + 'Change', this._selectedChangeFn, this);
    },
    
    _defPressFn : function(e) {
        var newSelected = (this.get(SELECTED) === 0) ? 1 : 0;
        
        this.set(SELECTED, newSelected);
        
        return new Y.Do.Prevent();
    },
    
    _selectedChangeFn : function(e){
        var isSelected = e.newVal,
            bb = this._host.get('boundingBox'),
            selectedClass = this._host._className + '-' + SELECTED;
            
        if(isSelected) {
            bb.addClass(selectedClass);
            this._host._executeCallback(e);
        }else{
            bb.removeClass(selectedClass);
            this._executeDeselectCallback(e);
        }
    },

    _executeDeselectCallback : function(e) {
        if(this.get(DESELECTED_CALLBACK)) {
            (this.get(DESELECTED_CALLBACK))(e);
        }
    }
    
}, {
    NS : 'tgl',
    ATTRS : {
        deselectedCallback : {
            validator : Y.Lang.isFunction,
            value : function(){}
        },
        selected : {
            value : 0
        }
    }
});

Y.namespace('Button.Plugin').Toggle = TogglePlugin;


/** Button Toggle **/
var Toggle = Y.Base.create('button', Y.Button.Advanced, [], {
    
    initializer : function(config) {
        this.plug(TogglePlugin, config);
    },
    
    bindUI : function() {
        
        this.after('selectedChange', function(e){
            this.set('toggleSelected', e.newVal);
        }, this);
        
        
        this.after('button:press', function(e){
            var selected = this.get('selected') === 1 ? 0 : 1;
            this.set('selected', selected);
        }, this);
        
        Toggle.superclass.bindUI.apply(this, arguments);
    },
    
    toggle : function() {
        if (this.hasPlugin('tgl')) {
            var togglePlugin = this.tgl;
            togglePlugin.set('selected', !togglePlugin.get('selected'));
        }
    },
    
    _deselectedCallbackSetter : function(val){
        if (this.hasPlugin('tgl')) {
            return this.tgl.set(DESELECTED_CALLBACK, val);
        }
        return null;
    },
    
    _deselectedCallbackGetter : function(){
        if (this.hasPlugin('tgl')) {
            return this.tgl.get(DESELECTED_CALLBACK);
        }
        return null;
    },
    
    _toggleSelectedSetter : function(val){
        if (this.hasPlugin('tgl')) {
            return this.tgl.set(SELECTED, val);
        }
        return null;
    },
    
    _toggleSelectedGetter : function(){
        if (this.hasPlugin('tgl')) {
            return this.tgl.get(SELECTED);
        }
        return null;
    }
    
}, {
    NAME : 'button',
    
    ATTRS : {
        
        deselectedCallback : {
            setter : '_' + DESELECTED_CALLBACK + 'Setter',
            getter : '_' + DESELECTED_CALLBACK + 'Getter'
        },
        
        toggleSelected : {
            setter : '_toggleSelectedSetter',
            getter : '_toggleSelectedGetter'
        },
        
        type : {
            value : 'toggle'
        }
    }
});


Y.namespace('Button').Toggle = Toggle;



}, '@VERSION@' ,{requires:['button-advanced','plugin','base-build']});
