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
