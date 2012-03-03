/**
 * @author Anthony Pipkin
 * @class Y.ButtonToggle
 * @module button-toggled
 * @extends Y.Button
 */

var YL = Y.Lang,
    DESELECTED_CALLBACK = 'deselectedCallback';

Y.ButtonToggle = Y.Base.create('button', Y.Button, [], {

    /**
     * @method bindUI
     * @public
     */
    bindUI : function(){
        this.after('selectedChange', this._afterSelectedChange, this);
        Y.ButtonToggle.superclass.bindUI.apply(this, arguments);
    },

    /**
     * @method _defPressFn
     * @protected
     */
    _defPressFn : function(e) {
      var newSelected = (this.get('selected') === 0) ? 1 : 0;
        this.set('selected', newSelected, {press:e});
    },

    /**
     * @method _afterSelectChange
     * @protected
     */
    _afterSelectedChange : function(e){
        if(e.newVal) {
          this._executeCallback(e.press);
        }else{
          this._executeDeselectCallback(e.press);
        }
    },

    /**
     * @method _executeDeselectCallback
     * @protected
     */
    _executeDeselectCallback : function(e) {
      Y.log('Y.ButtonToggle::_executeDeselectCallback');
      if(this.get(DESELECTED_CALLBACK)) {
        (this.get(DESELECTED_CALLBACK))(e);
      }
    }

}, {
    ATTRS : {
        /**
         * @attribute {Function} deselectedCallback
         */
        deselectedCallback : {
            validator : YL.isFunction
        }
    }
});