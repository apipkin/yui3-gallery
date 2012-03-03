/**
 *
 * @author Anthony Pipkin
 * @version 1.1.0
 * @module title
 * @class Y.Title
 * @extends Y.Base
 */

Y.Title = Y.Base.create('title', Y.Base, [Y.Plugin.Host], {

  /**
   * Local storage to Y.config.doc
   * @public {Object} doc
   * @property
   */
  doc : Y.config.doc,

  /**
   * Binds ATTRS changes and updates the title
   * @method initializer
   * @public
   * @see Y.Title::refresh
   */
  initializer : function() {
    this.after('titleChange', this._afterTitleChange);
    this.after('indicatorChange', this._afterIndicatorChange);
    this.after('separatorChange', this._afterSeparatorChange);

    if(this.get('title') === undefined) {
      this.set('title', this.doc.title);
    }

    this.refresh();
  },

  /**
   * Updates the title with the template.
   * @method refresh
   * @public
   */
  refresh : function() {
    var indicator = this.get('indicator'),
        title = this.get('title'),
        separator = this.get('separator'),
        display = this.get('displayTemplate'),
        displayConfig = {indicator:'', separator:'', title:''};

    if(indicator) {
      displayConfig.indicator = indicator;

      if(separator) {
        displayConfig.separator = separator;
      }

    }

    displayConfig.title = title;

    this.doc.title = Y.substitute(display, displayConfig);
  },

  /**
   * Updates the title after the ATTRS.title has been changed
   * @method _afterTitleChange
   * @protected
   */
  _afterTitleChange : function(e) {
    this.refresh();
  },

  /**
   * Updates the title after the ATTRS.indicator has been changed
   * @method _afterIndicatorChange
   * @protected
   */
  _afterIndicatorChange : function(e) {
    this.refresh();
  },

  /**
   * Updates the title after the ATTRS.seperator has been changed
   * @method _afterSeparatorChange
   * @protected
   */
  _afterSeparatorChange : function(e) {
    this.refresh();
  }

}, {
  ATTRS : {

    /**
     * @attribute title
     * @type {String}
     */
    title : {},

    /**
     * @attribute indicator
     * @type {String}
     */
    indicator : {
      value : ''
    },

    /**
     * @attribute separator
     * @type {String}
     */
    separator : {
      value : ' : '
    },

    /**
     * Template used to update the title. Uses getAttrs() to substitute.
     * @attribute displayTemplate
     * @type {String}
     */
    displayTemplate : {
      value : '{indicator}{separator}{title}'
    }

  }
});
