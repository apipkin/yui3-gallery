YUI.add('gallery-editor-plus', function(Y) {

var E;

Y.namespace('Xarno').EditorPlus = Y.Base.create('gallery-editor-plus', Y.Widget, [Y.WidgetStdMod], {

  _toolbar: null,

  _editor: null,

  _path: null,

  initializer: function(){
  },

  renderUI: function() {
    var editor = new Y.EditorBase({
      content: '<strong>Strong</strong> bar'
    });
    this.setStdModContent('body', '');

    editor.plug([
      Y.Plugin.EditorBiDi,
      Y.Plugin.EditorBr,
      Y.Plugin.EditorLists,
      Y.Plugin.EditorPara,
      Y.Plugin.EditorTab
    ]);
    this._editor = editor;
  },

  bindUI: function(){
    var editor = this._editor;
    editor.on('frame:ready', this._onEditorReady, this);
    editor.after('nodeChange', this._afterNodeChange, this);
  },

  syncUI: function(){
    var cb = this.get('contentBox'),
        editor = this._editor;

    editor.render(cb.one('.yui3-widget-bd'));

  },

  resizeFrame: function(){
    var region = this.get('contentBox').get('region');

    this._editor.frame.setAttrs({
      width: region.width,
      height: region.height
    });
  },

  _onEditorReady: function(e){
    var editor = this._editor;

    editor.focus();

    E = editor.getInstance();
    this.set('isReady', true);

    this.resizeFrame();
  },

  _afterNodeChange: function(e) {
    var list = Y.Node.create('<ul>');
    e.dompath.each(function(node) {
      list.append('<li>' + node.get('tagName') + '</li>');
      //this._editor.selectNode(node);
    }, this);

    this.setStdModContent('footer', list);
  }

},{
    ATTRS : {
      isReady: {
        value: false
      },
      toolbar: {
        value: ['b','i','u','|','align-left','align-center','align-right','|','font-family','font-size','styles']
      }
    }
});





}, '@VERSION@' ,{requires:['widget','widget-stdmod','base-build','editor'], skinnable:false});
