YUI.add('gallery-viewport', function(Y) {

/**
 * Gives the ability to update the viewport through a simplistic API based
 *   off the iOS specifications for viewport usage.
 *   
 * @author Anthony Pipkin
 * @version 1.0.0
 * @module viewport
 * @class Y.Viewport
 * @extends Y.Base
 */



var _attrs = ['width', 'height', 'initial-scale', 'minimum-scale', 'maximum-scale', 'user-scalable'];


Y.Viewport = Y.Base.create('viewport', Y.Base, [], {
    
    /**
     * @property {Array} _node
     * @protected
     */
    _node : null,
    
    /**
     * @property {Object} _defaults
     * @protected
     */
    _defaults : {},
    
    /**
     * @method initializer
     * @public
     */
    initializer : function(config){
        var initialViewport = Y.one('meta[name$=iewport],meta[name=VIEWPORT]');
        
        if (initialViewport) {
            this._node = initialViewport;
            this._parseViewport();
            if (this.get('mergeDefaults')) {
                this.mergeDefaults();
            }
        } else {
            initialViewport = Y.Node.create('<meta name="viewport">');
            Y.one('head').append(initialViewport);
        }
        
        this._node = initialViewport;

        this._bind();
        this.sync();
    },
    
    /**
     * @method _bind
     * @protected
     */
    _bind : function() {
        var events = [];
        
        Y.Array.each(_attrs, function(value, key) {
            events.push(value + 'Change');
        });
        
        this.after( events, this.syncUI, this);
    },
    
    /**
     * @method sync
     * @public
     */
    sync : function(){
        
        var content = [];
        
        Y.Array.each(_attrs, Y.bind(function(value, key) {
            
            var attr = this.get(value);
            
            if (attr) {
                content.push(value + '=' + attr);
            }
            
        }, this));
        
        this._node.setAttribute('content', content.join(','));
    },
    
    /**
     * Adds default values to the ATTRS without overriding existing values
     * @method mergeDefaults
     * @public
     */
    mergeDefaults : function(){
        var attrs = this.getAttrs(),
            defaults = this._defaults;
            
        Y.Object.each(defaults, Y.bind(function(value, key){
            if (!attrs[key]) {
                this.set(key, value);
            }
        }, this));
    },
    
    /**
     * @method reset
     * @public
     */
    reset : function() {
        
        var defaults = this._defaults;
        
        Y.Array.each(_attrs, Y.bind(function(value, key){
            var val = defaults[value] || null;
            
            this.set(value, val);
        }, this));
    },
    
    /**
     * Parses the existing viewport meta tag and place parts into the
     *   _defaults property
     * @method _parseViewport
     * @protected
     */
    _parseViewport : function(){
        var content = this._node.getAttribute('content').replace(' ','').toLowerCase(),
            defaults = {};
            
        Y.Array.each(content.split(','), Y.bind(function(val) {
            var bits = val.split('=');
            this._defaults[bits[0]] = bits[1];
        }, this));
    },
    
    /**
     * Sets the width of the viewport. Allows a value from 200 to 10,000.
     *   Set the value to null to remove it from the meta tag.
     * @method _widthSetter
     * @protected
     */
    _widthSetter : function (val) {
        if (val === null) {
            return val;
        }
        
        if (val === 'device-width') {
            return val;
        }
        
        return (val >= 200 && val <= 10000) ? val : null;
    },
    
    /**
     * Sets the height of the viewport. Allows a value from 223 to 10,000
     *   Set the value to null to remove it from the meta tag.
     * @method _heightSetter
     * @protected
     */
    _heightSetter : function (val) {
        if (val === null) {
            return val;
        }
        
        if (val === 'device-height') {
            return val;
        }
        
        return (val >= 223 && val <= 10000) ? val : null;
    },
    
    /**
     * Sets the miminum scale for the viewport. Allows a value from 0 to 10.
     *   The default value is 0.25.
     *   Set the value to null to remove it from the meta tag.
     * @method _minimumScaleSetter
     * @protected
     */
    _minimumScaleSetter : function (val) {
        if (val === null) {
            return val;
        }
        
        return (val > 0 && val <= 10) ? val : 0.25;
    },
    
    /**
     * Sets the maximum scal for the viewport. Allows a value from 0 to 10.
     *   The default value is 1.6.
     *   Set the value to null to remove it from the meta tag.
     * @method _maximumScaleSetter
     * @protected
     */
    _maximumScaleSetter : function (val) {
        if (val === null) {
            return val;
        }
        
        return (val > 0 && val <= 10) ? val : 1.6;
    },
    
    /**
     * Sets the allowability for the user to scale the viewport. Allows a
     *   value of "no" or "yes". Defaults to "yes" if the param is not correct.
     *   Set the value to null to remove it from the meta tag.
     * @method _userScalableSetter
     * @protected
     */
    _userScalableSetter : function (val) {
        if (val === null) {
            return val;
        }
        
        return (val === 'no') ? val : 'yes';
    }
    
}, {
    ATTRS : {
        /**
         * The width of the viewport in pixels. Also allows "device-width"
         * @attribute width
         * @see Y.Viewport:_widthSetter
         */
        width : {
            setter : '_widthSetter'
        },
        
        /**
         * The height of the viewport in pixels. Also allows "device-height"
         * @attribute height
         * @see Y.Viewport:_heightSetter
         */
        height : {
            setter : '_heightSetter'
        },
        
        /**
         * The initial scale of the viewport as a multiplier. The default is
         *   calculated to fit the webpage in the visible area. The range is
         *   determined by the minimum-scal and maximum-scale properties.
         * @attribute initial-scale
         */
        'initial-scale' : {
            
        },
        
        /**
         * Specifies the minimum scale value of the viewport.
         * @attribute minimum-scale
         * @see Y.Viewport:_minimumScaleSetter
         */
        'minimum-scale' : {
            setter : '_minimumScaleSetter'
        },
        
        /**
         * Specifies the maximum scale value of the viewport.
         * @attribute maximum-scale
         * @see Y.Viewport:_maximumScaleSetter
         */
        'maximum-scale' : {
            setter : '_maximumScaleSetter'
        },
        
        /**
         * Determines whether or not the user can zoom in and out - whether
         *   or not the user can change the scale of the viewport.
         * @attribute user-scalable
         * @see Y.Viewport:_userScalableSetter
         */
        'user-scalable' : {
            setter : '_userScalableSetter'
        },
        
        /**
         * Will merge any default viewport options with the current ATTRS
         *   values on initialization.
         * @attribute mergeDefaults
         */
        mergeDefaults : {
            value : true
        }
    }
});


}, '@VERSION@' ,{requires:['base','node']});
