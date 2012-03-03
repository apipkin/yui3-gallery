/**
 * @author Anthony Pipkin
 * @class Y.ButtonGroup
 * @module button-group
 * @extends Y.Widget
 */

var YL = Y.Lang;

Y.ButtonGroup = Y.Base.create('button-group', Y.Widget, [Y.WidgetParent,Y.WidgetChild], {

  /**
   * @property {String} labelNode
   * @public
   */
  labelNode : null,

  /**
   * @method initializer
   * @public
   */
  initializer : function(config) {
    Y.log('Y.ButtonGroup::initializer');

    this.labelNode = Y.Node.create('<span class="' + this.getClassName('label') + '"/>');
  },

  /**
   * @method renderUI
   * @public
   */
  renderUI : function() {
    Y.log('Y.ButtonGroup::renderUI');

    this.get('boundingBox').prepend(this.labelNode);
  },

  /**
   * @method bindUI
   * @public
   */
  bindUI : function() {
    Y.log('Y.ButtonGroup::bindUI');

    this.on('button:press', function(e) {
      if(this.get('alwaysSelected')) {
        var selection = this.get('selection'),
            button = e.target;

        if(selection === button || ( // selection is the button OR
          selection instanceof Y.ArrayList && // selection is an array AND
          selection.size() === 1 && // there is only one item AND
          selection.item(0) === button) // that one itme is the button
        ) {
          e.preventDefault();
        }

      }
    },this);
  },

  /**
   * @method syncUI
   * @public
   */
  syncUI : function() {
    Y.log('Y.ButtonGroup::syncUI');

    this.labelNode.set('text',this.get('label'));
  }

}, {
  ATTRS : {

    /**
     * @attribute {String} label
     */
    label : {
      validator : YL.isString,
      setter : function(val) {
        this.labelNode.set('text', val);
        return val;
      }
    },

    /**
     * @attribute {Object} defaultChildType
     */
    defaultChildType : {
      value : Y.Button
    },

    /**
     * @attribute {Boolean} alwaysSelected 
     */
    alwaysSelected : {
      value : false
    }
  }
});