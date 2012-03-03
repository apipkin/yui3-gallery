YUI.add('gallery-toolbar',function(Y){
    
    Y.Toolbar = Y.Base.create('toolbar',Y.Widget,[Y.WidgetParent],{
        BOUNDING_TEMPLATE : '<div/>',
        CONTENT_TEMPLATE : '<ul/>',
        
        _sortable : null, 
        
        syncUI : function() {
    		this.updateSortable();
    	},
        
        updateSortable : function() {
    		var cb = this.get('contentBox');
    		
    		this._sortable = new Y.Sortable({
    			container : cb,
    			nodes: 'li.yui3-toolbar-group-draggable',
    			opacity: '.2',
    			moveType: 'swap'
    		});
    	}
        
    },{
        ATTRS : {
        
        }
    });
    
    
    
},'0.1',{requires:['widget','widget-parent','widget-child','sortable','event-mouseenter','substitute']});