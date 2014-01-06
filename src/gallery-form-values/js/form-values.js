/**
 * @author Anthony Pipkin
 * @class Y.Form.Values
 * @module formValues
 * @extends Y.Plugin.Base
 */

Y.namespace('Form').Values = Y.Base.create('formValues', Y.Plugin.Base, [], {

  /**
   * @property {Object} _values
   * @protected
   */ 
  _values : null,

  /**
   * @method initializer
   * @public
   */
  initializer : function () {
    this.update();
  },

  /**
   * @method update
   * @public
   */
  update : function() {
    this._setFormValues();
  },

  /**
   * @method getValues
   * @public
   */
  getValues : function(){
    this.update();
    return this.get('values');
  },

  /**
   * @method _setFormValues
   * @protected
   */
  _setFormValues : function(){
    var _values = {},
        f = this.get('host');

    if(f !== null) {
      f.get('elements').each(function(field){
        var type = field.get('nodeName') + ':' + (field.get('type') || ''),
            name = field.get('name'),
            value;

        switch (type.toLowerCase()) {
          case 'input:' : // fall through intentional
          case 'input:text'   :
          case 'input:hidden' :
          case 'input:file' :
          case 'input:password' :
		  case 'input:number' :
          case 'textarea:'    :
          case 'textarea:textarea'    :
          case 'select:'      :
          case 'select:select-one' :
            value = field.get('value');
            break;
            
          case 'select:select-multiple' :
            value = [];
            field.all('option').each(function(opt){
              if(opt.get('selected')) {
                value.push(opt.get('value'));
              }
            });
            break;

          case 'input:radio'    : // fall through intentional
          case 'input:checkbox' :
            value = field.get('checked') ? field.get('value') : undefined;
            break;
        }

        if(value !== undefined) {
          if (name in _values) {
            if(!Y.Lang.isArray(_values[name])) {
              _values[name] = [_values[name]];
            }
            _values[name].push(value);
          }else{
            _values[name] = value;
          }
        }
      });
    }

    this.set('values', _values);
  }
},{
  NS : 'values',
  ATTRS : {
    /**
     * @attribute {Boolean} values
     */
    values : {
      readonly : true
    }
  }
});