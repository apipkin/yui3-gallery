var DEFAULT = 'default',
    ENABLED = 'enabled',
    DISABLED = 'disabled',
    INNER_HTML = 'innerHTML',
    HREF = 'href',
    TITLE = 'title',
    TAB_INDEX = 'tabIndex',

    ButtonAdvanced = Y.Base.create('button', Y.Widget, [Y.Button.Base, Y.WidgetChild], {
    
    BOUNDING_TEMPLATE : '<a />',
    
    CONTENT_TEMPLATE : '<span />',
    
    _className : null,

    
    _defaultCB : function(){
        Y.log('_defaultCB', 'info', 'Button.Advanced');
        return null;
    },
    
    initializer : function(){
        Y.log('initializer', 'info', 'Button.Advanced');
        this._className = this.getClassName();
        this._baseInitializer();
    },
    
    renderUI : function(){
        Y.log('renderUI', 'info', 'Button.Advanced');
        this._baseRenderUI();
    },
    
    bindUI : function(){
        Y.log('bindUI', 'info', 'Button.Advanced');
        this._baseBindUI();
    },
    
    syncUI : function() {
        Y.log('syncUI', 'info', 'Button.Advanced');
        this._updateDefault(this.get(DEFAULT));
        this._updateEnabled(this.get(ENABLED));
        this._updateTabIndex(this.get(TAB_INDEX));
    }
    
}, {
    ATTRS : {},
    /**
     * HTML Parser assumes srcNode is either a &lt;button&gt; or 
     *   &lt;input type="submit|reset"&gt;
     * @since 1.0.0
     */
    HTML_PARSER : {
  
        enabled : function(srcNode) {
            return !srcNode.get(DISABLED);
        },
        
        label : function(srcNode) {
            if(srcNode.getAttribute('value')) {
                return srcNode.getAttribute('value');
            }
            if(srcNode.get(INNER_HTML)) {
                return srcNode.get(INNER_HTML);
            }
            
            // default form button labels based on type
            if(srcNode.get('tagName') === 'INPUT') {
                switch (srcNode.get('type')) {
                    case 'reset' : return 'Reset';
                    case 'submit' : return 'Submit';
                }
            }
            
            return null;
        },
        
        href : function(srcNode) {
            var href = srcNode.getAttribute(HREF);
            
            if(href) { 
                return href; 
            }
            
            return null;
        },
        
        type : function(srcNode) {
            var type = srcNode.getAttribute('type');
            
            if(type) {
                return type;
            }
            return null;
        },
        
        title : function(srcNode) {
            if(srcNode.getAttribute(TITLE)) {
                return srcNode.getAttribute(TITLE);
            }
            if(srcNode.getAttribute('value')) {
                return srcNode.getAttribute('value');
            }
            if(srcNode.get(INNER_HTML)) {
                return srcNode.get(INNER_HTML);
            }
            return null;
        }
    }
});

Y.namespace('Button').Advanced = ButtonAdvanced;
