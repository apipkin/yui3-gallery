YUI.add('button-group', function(Y) {

var LANG = Y.Lang,
    Group = null;
    
    
Group = Y.Base.create('button-group', Y.Widget, [Y.WidgetParent, Y.WidgetChild], {
    
    labelNode : null,
    
    initializer : function(config) {
        
    },
    
    renderUI : function(){
        var label = Y.Node.create('<span class="' + this._className + '-label"/>');
        
        this.get('boundingBox').prepend(label);
        
        this.labelNode = label;
    },
    
    bindUI : function() {
        this.on('button:press', function(e) {
            if(this.get('alwaysSelected')) {
                var selection = this.get('selection'),
                    selected = e.target;
                    
                if(selection === selected || ( // selection is the button OR
                    selected instanceof Y.ArrayList && // selection is an array AND
                    selected.size() === 1 && // there is only one item AND
                    selected.item(0) === selected) // that one itme is the button
                ) {
                    e.preventDefault();
                }
                
            }
        },this);
    },
    
    syncUI : function() {
        this.labelNode.setContent(this.get('label'));
    },
    
    
    
    _labelSetter : function(val) {
        var labelNode = this.labelNode;
        
        if (labelNode) {
            labelNode.setContent(val);
        }
        return val;
    }
    
}, {
    ATTRS : {
        label : {
            validator : LANG.isString,
            setter : '_labelSetter'
        },
        
        defaultChildType : {
            value : Y.Button.Advanced
        },
        
        alwaysSelected : {
            value : false
        }
    }
});

Y.namespace('Button').Group = Group;


}, '@VERSION@' ,{requires:['base-build','widget','widget-parent','widget-child','button-advanced']});
