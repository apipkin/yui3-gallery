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
