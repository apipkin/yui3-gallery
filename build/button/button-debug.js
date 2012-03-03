YUI.add('button-base', function(Y) {

/**
 * The Button widget creates anchor span (&lt;a&gt;&lt;span/&gt;&lt;/a&gt;)
 *   markup to allow tab focus, push links, and attribute to css flexibility
 * @module button
 * @submodule button-base
 * @version 1.0.0
 * @author Anthony Pipkin
 */

/**
 * Static variabls for compression
 */
var LANG = Y.Lang,
    YCM = Y.ClassNameManager,
    EMPTY_FN = function(){},
    
    EVENT_PRESS = 'press',
    
    TYPE = 'type',
    TYPE_PUSH = 'push',
    TYPE_SUBMIT = 'submit',
    TYPE_RESET = 'reset',
    TYPE_SPLIT = 'split',
    TYPE_MENU = 'menu',
    TYPE_SELECT = 'select',
    
    CLASS_PRESSED = '-pressed',
    CLASS_DEFAULT = '-default',
    CLASS_DISABLED = '-disabled',
    CLASS_NO_LABEL = 'no-label',
    
    BEFORE = 'before',
    AFTER = 'after',
    
    BOUNDING_BOX = 'boundingBox',
    CALLBACK = 'callback',
    CHANGE = 'Change',
    CONTENT_BOX = 'contentBox',
    DEFAULT = 'default',
    DISABLED = 'disabled',
    ENABLED = 'enabled',
    HREF = 'href',
    ICON = 'icon',
    LABEL = 'label',
    TAB_INDEX = 'tabIndex',
    TITLE = 'title';
    
function ButtonBase(config) {};
  
ButtonBase.EVENTS = {
    PRESS : EVENT_PRESS
};

ButtonBase.TYPES = {
    PUSH : TYPE_PUSH,
    RESET : TYPE_RESET,
    SUBMIT : TYPE_SUBMIT
};

ButtonBase.ATTRS = {
    
    /**
     * Returns a string of the Button label
     * @lazyAdd false
     * @config label
     * @type string
     */    
    label : {
        valueFn : '_labelValueFn',
        validator : LANG.isString,
        setter : '_labelSetterFn',
        lazyAdd : false
    },
    
    /**
     * Returns a function as the callback when the button is clicked
     * @config callback
     * @type function
     */
    callback : {
        validator : LANG.isFunction
    },
    
    /**
     * Returns a boolean value describing the enabled state of the button
     * @config enabled
     * @default true
     * @type boolean
     */
    enabled : {
        value : true,
        validator : LANG.isBoolean
    },
        
    /**
     * Returns a boolean value describing if the button should get the default
     *   state of the container
     * @config default
     * @default false
     * @type boolean
     */
    'default' : {
        value : false,
        validator : LANG.isBoolean
    },
    
    /**
     * Returns a string of the name of the icon of the button
     * @config icon
     * @lazyAdd false
     * @type string
     */
    icon : {
        value : DEFAULT,
        setter : '_iconSetterFn',
        lazyAdd : false
    },
    
    iconPosition : {
        value : BEFORE
    },
    
    iconTemplate : {
        value : '<span class="yui3-icon" />'
    },
    
    /**
     * Returns the href value of the button. Setting this value will make the
     *   button a link button
     * @config href
     * @default null
     * @type String
     */
    href : {
        value : '#'
    },
    
    /**
     * Returns the title string of the button. The title is used as the tooltip
     *   when a mouse is hovered over the button
     * @config title
     * @type String
     */
    title : {
        validator : LANG.isString,
        setter : '_titleSetterFn'
    },
    
    /**
     * Returns the tab index of the button. Setting to -1 will remove the tab
     *   to focus ability on the button
     * @config tabIndex
     * @default 0
     * @type Integer
     */
    tabIndex : {
        value : 0
    },
    
    /**
     * Returns the button type.
     * @config type
     * @defalt "push"
     * @type String
     */
    type : {
        value : TYPE_PUSH,
        validator : LANG.isString,
        lazyAdd : false
    }
};

ButtonBase.prototype = {
    
    /**
     * @attribute _className
     * @protected
     * @type {String}
     */
    _className : null,
    
    /**
     * @attribute _mouseIsDown
     * @protected
     * @type {Boolean}
     */
    _mouseIsDown : false,
    
    /**
     * @attribute _mouseUpHandle
     * @protected
     * @type {Event Handle}
     */
    _mouseUpHandle : null,
    
    /**
     * @attribute _iconNode
     * @protected
     * @type {Node}
     */
    _iconNode : null,

    /**
     * @method _baseInitializer
     * @protected
     * @see Y.Button.Base#_defPressFn
     * @returns void
     */
    _baseInitializer : function(){
        Y.log('_baseInitializer', 'info', 'Button.Base');
        this.publish(EVENT_PRESS, {
            /**
             * @bug 2529869
             * Wrapping with anonymous function to help Y.Do
             */
            defaultFn: function(){
                this._defPressFn.apply(this, arguments);
            }
        });
    },
    
    /**
     * @method _baseInitializer
     * @protected
     * @see Y.Button.Base#_appendIcon
     * @returns void
     */
    _baseRenderUI : function(){
        Y.log('_baseRenderUI', 'info', 'Button.Base');
        
        var href = this.get(HREF);
        if (href) {
            this.get(BOUNDING_BOX).setAttribute(HREF, href);
        } else {
            this.get(BOUNDING_BOX).set(TAB_INDEX, 0);
        }
        
        this.get(CONTENT_BOX).setContent(this.get(LABEL));
        
        this._updateIcon();
    },
    
    /**
     * @method _baseInitializer
     * @protected
     * @see Y.Button.Base#_defClickFn
     * @see Y.Button.Base#_mouseUp
     * @see Y.Button.Base#_mouseDown
     * @see Y.Button.Base#_afterTabIndexChange
     * @see Y.Button.Base#_afterDefaultChanged
     * @see Y.Button.Base#_afterEnabledChanged
     * @see Y.Button.Base#_afterIconPositionChanged
     * @see Y.Button.Base#_afterIconTemplateChanged
     * @returns void
     */
    _baseBindUI : function(){
        Y.log('_baseBindUI', 'info', 'Button.Base');
        var bb = this.get(BOUNDING_BOX);
        bb.on('click', this._defClickFn, this);
        bb.on('mouseup', this._mouseUp, this);
        bb.on('mousedown', this._mouseDown, this);
        bb.after(TAB_INDEX + CHANGE, this._afterTabIndexChange, this);
        this.after(DEFAULT + CHANGE, this._afterDefaultChanged, this);
        this.after(ENABLED + CHANGE, this._afterEnabledChanged, this);
        this.after(ICON + 'Position' + CHANGE, this._afterIconPositionChanged, this);
        this.after(ICON + 'Template' + CHANGE, this._afterIconTemplateChanged, this);
    },
    
    _baseSyncUI : function(){},

     
    /** SUGAR **/
    
    /**
     * @method _baseInitializer
     * @public
     * @returns this
     * @chainable
     */
    disable : function(){
        Y.log('disable','info','Button.Base');
        this.set(ENABLED, false);
        return this;
    },
    
    /**
     * @method _baseInitializer
     * @public
     * @returns this
     * @chainable
     */
    enable : function(){
        Y.log('enable','info','Button.Base');
        this.set(ENABLED, true);
        return this;
    },
    
    /** DEFAULT EVENT FUNCTIONS **/
    
    /**
     * @method _baseInitializer
     * @protected
     * @param {Event} e
     * @returns void
     */
    _defClickFn : function(e){
        Y.log('_defClickFn', 'info', 'Button.Base');
        var href = this.get(HREF);
        
        if (!this.get(ENABLED)) {
            e.preventDefault();
            return;
        }
        
        if (!href || href === '#') {
            e.preventDefault();
        }
        
        this.fire(EVENT_PRESS, { click : e });
    },

    /**
     * @method _baseInitializer
     * @protected
     * @param {Event} e
     * @see Y.Button.Base#_executeCallback
     * @returns void
     */
    _defPressFn : function(e){
        Y.log('_defPressFn', 'info', 'Button.Base');
        this._executeCallback(e);
    },

    /** MOUSE HELPERS **/
    
    /**
     * @method _baseInitializer
     * @protected
     * @see Y.Button.Base#_mouseUpHandle
     * @returns void
     */
    _mouseUp : function(){
        Y.log('_mouseUp', 'info', 'Button.Base');
        this.get(BOUNDING_BOX).removeClass(this._className + CLASS_PRESSED);
        this._mouseIsDown = false;
        if (this._mouseUpHandle !== null) {
            this._mouseUpHandle.detach();
            this._mouseUpHandle = null;
        }
    },

    /**
     * @method _baseInitializer
     * @protected
     * @see Y.Button.Base#_listenForMouseUp
     * @returns void
     */
    _mouseDown : function(){
        Y.log('_mouseDown', 'info', 'Button.Base');
        if (this.get(ENABLED)) {
            this.get(BOUNDING_BOX).addClass(this._className + CLASS_PRESSED);
            this._mouseIsDown = true;
            if (this._mouseUpHandle === null) {
                this._mouseUpHandle = Y.on('mouseup', Y.bind(this._listenForMouseUp, this));
            }
        }
    },

    /**
     * @method _baseInitializer
     * @protected
     * @see Y.Button.Base#_mouseUp
     * @returns void
     */
    _listenForMouseUp : function(){
        Y.log('_listenForMouseUp', 'info', 'Button.Base');
        this._mouseUp();
    },

    /** CALLBACK METHODS **/
    
    /**
     * @method _baseInitializer
     * @protected
     * @param {Event} e
     * @see Y.Button.Base#_callbackFromType
     * @returns void
     */
    _executeCallback : function(e) {
        Y.log('_executeCallback', 'info', 'Button.Base');
        if (this.get(CALLBACK)) {
            (this.get(CALLBACK))(e);
        } else {
            (this._callbackFromType())(e);
        }
    },
    
    /**
     * @method _baseInitializer
     * @protected
     * @returns Function
     */
    _callbackFromType : function(){
        Y.log('_callbackFromType', 'info', 'Button.Base');
        var frm = this.get(BOUNDING_BOX).ancestor('form');
        
        switch ( this.get(TYPE)) {
            case TYPE_SUBMIT:
                Y.log('type:: submit');
                if (frm) {
                    Y.log(frm);
                    return Y.bind(frm.submit, frm);
                }
                break;
            case TYPE_RESET:
                if (frm) {
                    return Y.bind(frm.reset, frm);
                }
                break;
        }
        return EMPTY_FN;
    },
    
    /** UPDATERS **/
    
    /**
     * @method _updateIcon
     * @protected
     * @returns void
     */
    _updateIcon : function(){
        Y.log('_updateIcon', 'info', 'Button.Base');
        var position = this.get('iconPosition'),
            bb = this.get('boundingBox'),
            iconNode = this._iconNode || Y.Node.create(this.get('iconTemplate'));
            
        if (position === AFTER) {
            bb.append(iconNode);
        } else {
            bb.prepend(iconNode);
        }
        
        this._iconNode = iconNode;
    },
    
    /**
     * @method _baseInitializer
     * @protected
     * @param {Boolean} isEnabled
     * @returns void
     */
    _updateEnabled : function(isEnabled){
        Y.log('_updateEnabled', 'info', 'Button.Base');
        var bb = this.get(BOUNDING_BOX),
            disableClass = this._className + CLASS_DISABLED;
            
        if (isEnabled) {
            bb.removeClass(disableClass);
            bb.removeAttribute(DISABLED);
        } else {
            bb.addClass(disableClass);
            bb.removeClass(this._className + CLASS_PRESSED);
            bb.setAttribute(DISABLED, DISABLED);
        }
    },

    /**
     * @method _baseInitializer
     * @protected
     * @param {Boolean} isDefault
     * @returns void
     */
    _updateDefault : function(isDefault) {
        Y.log('_updateDefault', 'info', 'Button.Base');
        var bb = this.get(BOUNDING_BOX),
            defaultClass = this._className + CLASS_DEFAULT;
            
        if (isDefault) {
            bb.addClass(defaultClass);
            bb.setAttribute(DEFAULT, DEFAULT);
        } else {
            bb.removeClass(defaultClass);
            bb.removeAttribute(DEFAULT);
        }
    },
    
    /**
     * @method _baseInitializer
     * @protected
     * @param {Integer} index
     * @returns void
     */
    _updateTabIndex : function(index) {
        Y.log('_updateTabIndex', 'info', 'Button.Base');
        var bb = this.get(BOUNDING_BOX);
        
        if (index !== undefined && index !== null){
            bb.setAttribute(TAB_INDEX, index);
        } else {
            bb.removeAttribute(TAB_INDEX);
        }
    },
    
    /** ATTR EVENTS **/
    
    /**
     * @method _afterIconPositionChanged
     * @protected
     * @param {Event} e
     * @see Y.Button.Base#_updateIcon
     * @returns void
     */
    _afterIconPositionChanged : function(e){
        Y.log('_afterIconPositionChanged', 'info', 'Button.Base');
        this._updateIcon();
    },
    
    /**
     * @method _afterIconTemplateChanged
     * @protected
     * @param {Event} e
     * @see Y.Button.Base#_updateIcon
     * @returns void
     */
    _afterIconTemplateChanged : function(e){
        Y.log('_afterIconTemplateChanged', 'info', 'Button.Base');
        if (this._iconNode) {
            this._iconNode.remove(true);
        }
        this._iconNode = null;
        this._updateIcon();
    },
    
    /**
     * @method _afterEnabledChanged
     * @protected
     * @param {Event} e
     * @see Y.Button.Base#_updateEnabled
     * @returns void
     */
    _afterEnabledChanged : function(e){
        Y.log('_afterEnabledChanged', 'info', 'Button.Base');
        this._updateEnabled(e.newVal);
    },

    /**
     * @method _afterDefaultChanged
     * @protected
     * @param {Event} e
     * @see Y.Button.Base#_updateDefault
     * @returns void
     */
    _afterDefaultChanged : function(e){
        Y.log('_afterDefaultChanged', 'info', 'Button.Base');
        this._updateDefault(e.newVal);
    },
    
    /**
     * @method _afterTabIndexChange
     * @protected
     * @param {Event} e
     * @see Y.Button.Base#_updateTabIndex
     * @returns void
     */
    _afterTabIndexChange : function(e){
        Y.log('_afterTabIndexChange', 'info', 'Button.Base');
        this._updateTabIndex(e.newVal);
    },
    
    /** ATTR SETTERS **/
    
    /**
     * @method _iconSetterFn
     * @protected
     * @param {String} val
     * @returns val
     */
    _iconSetterFn : function(val) {
        Y.log('_iconSetterFn', 'info', 'Button.Base');
        this.get(BOUNDING_BOX).replaceClass(
            YCM.getClassName(ICON, this.get(ICON) || DEFAULT),
            YCM.getClassName(ICON, val || DEFAULT)
        );
        return val;
    },
    
    /**
     * @method _labelSetterFn
     * @protected
     * @param {String} val
     * @returns val
     */
    _labelSetterFn : function(val) {
        Y.log('_labelSetterFn', 'info', 'Button.Base');
        var title = this.get(TITLE);
        
        if (!val || val === '') {
            this.get(BOUNDING_BOX).addClass(this.getClassName(CLASS_NO_LABEL));
        } else {
            this.get(BOUNDING_BOX).removeClass(this.getClassName(CLASS_NO_LABEL));
        }
        this.get(CONTENT_BOX).setContent(val);
        
        if (title === '' || title === null || title === undefined) {
            this.set(TITLE, val);
        }
        
        return val;
    },
    
    /**
     * @method _titleSetterFn
     * @protected
     * @param {String} val
     * @returns String val
     */
    _titleSetterFn : function(val) {
        Y.log('_titleSetterFn', 'info', 'Button.Base');
        this.get(BOUNDING_BOX).set(TITLE, val);
        return val;
    },
    
    /** ATTR VALUE FN **/
    
    /**
     * @method _labelValueFn
     * @protected
     * @returns void
     */
    _labelValueFn : function(){}
};


Y.namespace('Button').Base = ButtonBase;


}, '@VERSION@' ,{requires:['node','event','event-mouseenter','classnamemanager']});
YUI.add('button-simple', function(Y) {

var DEFAULT = 'default',
    ENABLED = 'enabled',
    TAB_INDEX = 'tabIndex',
    BOUNDING_BOX = 'boundingBox',
    CONTENT_BOX = 'contentBox';
    


Y.namespace('Button').Simple = Y.Base.create('button-simple', Y.Plugin.Base, [Y.Button.Base], {
    
    _cssPrefix: null,
    
    
    initializer : function(){
        Y.log('initializer', 'info', 'Button.Simple');
        this._baseInitializer();
        this._className = 'yui3-button';
        this._render();
    },
    
    _render : function(){
        Y.log('_render', 'info', 'Button.Simple');
        this._renderUI();
        this._bindUI();
        this._syncUI();
    },
    
    _renderUI : function(){
        Y.log('_renderUI', 'info', 'Button.Simple');
        
        this._updateType();
        this._updateNode();
        
        this.get(BOUNDING_BOX).addClass(this.getClassName());
        
        this.get(CONTENT_BOX).addClass(this.getClassName('content'))
        
        this._updateIcon();
    },
    
    _bindUI : function(){
        Y.log('_bindUI', 'info', 'Button.Simple');
        this._baseBindUI();
    },
    
    _syncUI : function(){
        Y.log('_syncUI', 'info', 'Button.Simple');
        this._updateDefault(this.get(DEFAULT));
        this._updateEnabled(this.get(ENABLED));
        this._updateTabIndex(this.get(TAB_INDEX));
    },
    
    getClassName: Y.cached(function () {

        var args = Y.Array(arguments),
            sPrefix = 'yui3-button',
            sDelimiter = '-';

        if (args[args.length-1] !== true) {
            args.unshift(sPrefix);
        } else {
            args.pop();
        }

        return args.join(sDelimiter);
    }),
    
    /** ATTRS GETTER FN **/
    _boundingBoxGetterFn : function(){
        Y.log('_boundingBoxGetterFn', 'info', 'Button.Simple');
        return this.get('host');
    },
    
    _contentBoxGetterFn : function(){
        Y.log('_contentBoxGetterFn', 'info', 'Button.Simple');
        var bb = this.get(BOUNDING_BOX),
            firstChild = bb.one('>*');
        if (firstChild) {
            return firstChild;
        } else {
            return bb;
        }
    },
    
    _labelValueFn : function(){
        var cb = this.get(CONTENT_BOX),
            cont = cb.getContent();
        
        if (cont === '' && cb.get('tagName').toUpperCase() === 'INPUT') {
            cont = cb.getAttribute('value');
            if (cont === '') {
                if (cb.getAttribute('type').toUpperCase() === 'SUBMIT') {
                    cont = 'Submit';
                } else if (cb.getAttribute('type').toUpperCase() === 'RESET') {
                    cont = 'Reset';
                }
            }
        }
        
        return cont.replace('<','&lt;').replace('>','&gt;');
    },
    
    _updateType : function() {
        Y.log('_updateType', 'info', 'Y.Button.Simple');
        
        var host = this.get('host'),
            tag = host.get('tagName').toUpperCase(),
            TYPES = Y.Button.Base.TYPES,
            href, type;
        
        if (tag === 'A') {
            href = host.getAttribute('href');
            if (href || href !== '#') {
                this.set('type', TYPES.LINK);
                this.set('href', href);
                return;
            }
        }
        
        if (tag === 'INPUT') {
            type = host.getAttribute('type').toUpperCase();
            if (type === 'SUBMIT') {
                this.set('type', TYPES.SUBMIT);
                return;
            } else if (type === 'RESET') {
                this.set('type', TYPES.RESET);
                return;
            }
        }
        
        this.set('type', TYPES.LINK);
    },
    
    _updateNode : function() {
        Y.log('_updateNode', 'info', 'Y.Button.Simple');
        
        var host = this.get('host'),
            tag = host.get('tagName').toUpperCase(),
            bb, cb, cont;
        
        if (tag !== 'A') {
            bb = Y.Node.create('<a>');
            
            bb.setContent(host.getContent());
            
            bb.setAttribute('class', host.getAttribute('class'));
            bb.setAttribute('id', host.getAttribute('id'));
            host.replace(bb);
            
            // update host
            this._setStateVal('host', bb);
            host = bb;
        }
        
        cb = host.one('>*');
        if (cb === null) { // no content box
            cont = host.getContent();
            cb = Y.Node.create('<span>');
            
            if (cont) {
                cb.setContent(cont);
            } else {
                cb.setContent(this.get('label'));
            }
            
            host.setContent(cb);
        }
        Y.log(this.getAttrs());
    }

    
}, {
    NS : 'button',
    ATTRS : {
        boundingBox : {
            getter : '_' + BOUNDING_BOX + 'GetterFn'
        },
        
        contentBox : {
            getter : '_' + CONTENT_BOX + 'GetterFn'
        }
    }
});


}, '@VERSION@' ,{requires:['button-base','base-build','plugin','classnamemanager']});
YUI.add('button-advanced', function(Y) {

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


}, '@VERSION@' ,{requires:['button-base','base-build','widget','widget-child']});
YUI.add('button-toggle', function(Y) {

var LANG = Y.Lang,
    DESELECTED_CALLBACK = 'deselectedCallback',
    SELECTED = 'selected',
    TogglePlugin = null;

/** Button Toggle Plugin **/
TogglePlugin = Y.Base.create('button-plugin-toggle', Y.Plugin.Base, [], {
    
    _host : null,
    
    initializer : function(){
        Y.log('initializer', 'info', 'Y.Button.Plugin.Toggle');
        this._host = this.get('host');
        this.beforeHostMethod("_defPressFn", this._defPressFn);
        this.after(SELECTED + 'Change', this._selectedChangeFn, this);
    },
    
    _defPressFn : function(e) {
        Y.log('_defPressFn', 'info', 'Y.Button.Plugin.Toggle');
        var newSelected = (this.get(SELECTED) === 0) ? 1 : 0;
        
        this.set(SELECTED, newSelected);
        
        return new Y.Do.Prevent();
    },
    
    _selectedChangeFn : function(e){
        Y.log('_selectedChangeFn', 'info', 'Y.Button.Plugin.Toggle');
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
        Y.log('_executeDeselectCallback', 'info', 'Y.Button.Plugin.Toggle');
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
        Y.log('initializer', 'info', 'Y.Button.Toggle');
        this.plug(TogglePlugin, config);
    },
    
    bindUI : function() {
        Y.log('bindUI', 'info', 'Y.Button.Toggle');
        
        this.after('selectedChange', function(e){
            Y.log('after selectedChange');
            this.set('toggleSelected', e.newVal);
        }, this);
        
        
        this.after('button:press', function(e){
            Y.log('after button:press');
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
        Y.log('_deselectedCallbackSetter','info','Y.Button.Toggle');
        if (this.hasPlugin('tgl')) {
            return this.tgl.set(DESELECTED_CALLBACK, val);
        }
        return null;
    },
    
    _deselectedCallbackGetter : function(){
        Y.log('_deselectedCallbackGetter','info','Y.Button.Toggle');
        if (this.hasPlugin('tgl')) {
            return this.tgl.get(DESELECTED_CALLBACK);
        }
        return null;
    },
    
    _toggleSelectedSetter : function(val){
        Y.log('_toggleSelectedSetter','info','Y.Button.Toggle');
        if (this.hasPlugin('tgl')) {
            return this.tgl.set(SELECTED, val);
        }
        return null;
    },
    
    _toggleSelectedGetter : function(){
        Y.log('_toggleSelectedGetter','info','Y.Button.Toggle');
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
        Y.log('initializer', 'info', 'Y.Button.Plugin.Panel');
        this._host = this.get('host');
        VISIBLE_CLASS = this._host._className + '-panel-' + VISIBLE;
        this.afterHostMethod('render', this._render, this);
        this.afterHostEvent('press', this.toggleVisible, this);
    },
    
    _render : function(){
        Y.log('_render', 'info', 'Y.Button.Plugin.Panel');
        this._renderUI();
        this._bindUI();
        this._syncUI();
    },
    
    _renderUI : function(){
        Y.log('_renderUI', 'info', 'Y.Button.Plugin.Panel');
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
        Y.log('_bindUI', 'info', 'Y.Button.Plugin.Panel');
        this.after(PANEL_VISIBLE + 'Change', this._visibilityChange, this);
        this.after(PANEL_CONTENT + 'Change', this._contentChange, this);
        this._panelNode.on('click', function(e){
            this.set('panelVisible', false);
        }, this);
    },
    
    _syncUI : function() {
        Y.log('_syncUI', 'info', 'Y.Button.Plugin.Panel');
        this._updateVisibility(this.get(PANEL_VISIBLE));
    },
    
    toggleVisible : function() {
        Y.log('toggleVisible', 'info', 'Y.Button.Plugin.Panel');
        this.set(PANEL_VISIBLE, !this.get(PANEL_VISIBLE));
    },
    
    _visibilityChange : function(e) {
        Y.log('_visibilityChange', 'info', 'Y.Button.Plugin.Panel');
        this._updateVisibility(e.newVal);
    },
    
    _updateVisibility : function(value){
        Y.log('_updateVisibility', 'info', 'Y.Button.Plugin.Panel');
        
        value = LANG.isBoolean(value) ? value : false;
        
        if ( value ) {
            this._showPanel();
        } else {
            this._hidePanel();
        }
    },
    
    _showPanel : function(){
        Y.log('_showPanel', 'info', 'Y.Button.Plugin.Panel');
        this._panelNode.addClass(VISIBLE_CLASS);
    },
    
    _hidePanel : function(){
        Y.log('_hidePanel', 'info', 'Y.Button.Plugin.Panel');
        this._panelNode.removeClass(VISIBLE_CLASS);
    },
    
    _contentChange : function(e) {
        Y.log('_contentChange', 'info', 'Y.Button.Plugin.Panel');
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
        Y.log('_panelNodeSetter', 'info', 'Y.Button.Panel');
        if (this.hasPlugin('pnl')) {
            return this.pnl.set(PANEL_NODE, val);
        }
        return val;
    },
    
    _panelNodeGetter : function(){
        Y.log('_panelNodeGetter', 'info', 'Y.Button.Panel');
        if (this.hasPlugin('pnl')) {
            return this.pnl.get(PANEL_NODE);
        }
        return val;
    },
    
    _panelContentSetter : function(val){
        Y.log('_panelContentSetter', 'info', 'Y.Button.Panel');
        if (this.hasPlugin('pnl')) {
            return this.pnl.set(PANEL_CONTENT, val);
        }
        return val;
    },
    
    _panelContentGetter : function(){
        Y.log('_panelContentGetter', 'info', 'Y.Button.Panel');
        if (this.hasPlugin('pnl')) {
            return this.pnl.get(PANEL_CONTENT);
        }
        return val;
    },
    
    _panelVisibleSetter : function(val){
        Y.log('_panelVisibleSetter', 'info', 'Y.Button.Panel');
        if (this.hasPlugin('pnl')) {
            return this.pnl.set(PANEL_NODE, val);
        }
        return val;
    },
    
    _panelVisibleGetter : function(){
        Y.log('_panelVisibleGetter', 'info', 'Y.Button.Panel');
        if (this.hasPlugin('pnl')) {
            return this.pnl.get(PANEL_NODE);
        }
        return val;
    },
    
    _panelOfsetSetter : function(val){
        Y.log('_panelOfsetSetter', 'info', 'Y.Button.Panel');
        if (this.hasPlugin('pnl')) {
            return this.pnl.set(PANEL_OFFSET, val);
        }
        return val;
    },
    
    _panelOffsetGetter : function(){
        Y.log('_panelOffsetGetter', 'info', 'Y.Button.Panel');
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
YUI.add('button-group', function(Y) {

var LANG = Y.Lang,
    Group = null;
    
    
Group = Y.Base.create('button-group', Y.Widget, [Y.WidgetParent, Y.WidgetChild], {
    
    labelNode : null,
    
    initializer : function(config) {
        
    },
    
    renderUI : function(){
        Y.log('renderUI', 'info', 'Y.Button.Group');
        var label = Y.Node.create('<span class="' + this._className + '-label"/>');
        
        this.get('boundingBox').prepend(label);
        
        this.labelNode = label;
    },
    
    bindUI : function() {
        Y.log('bindUI', 'info', 'Y.Button.Group');
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
        Y.log('syncUI', 'info', 'Y.Button.Group');
        this.labelNode.setContent(this.get('label'));
    },
    
    
    
    _labelSetter : function(val) {
        Y.log('_labelSetter', 'info', 'Y.Button.Group');
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


YUI.add('button', function(Y){}, '@VERSION@' ,{use:['button-base', 'button-simple', 'button-advanced']});

