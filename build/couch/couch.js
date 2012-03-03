YUI.add('couch-base', function(Y) {

/**
 * Provides a common interface for data source and error publishing
 * @module couch
 * @submodule couch-base
 * @class Y.Couch.Base
 * @extends Y.Base
 * @author Anthony Pipkin
 */

var LANG = Y.Lang,
    IS_BOOLEAN = LANG.isBoolean,
    DATA_SOURCE = 'dataSource',
    EVENT_ERROR = 'couch:error';

Y.namespace('Couch').Base = Y.Base.create('couch-base', Y.Base, [], {
    
    /**
     * Fired when a datasource fails. Logs an error message by default.
     * @event couch:error
     */
    
    /**
     * Publishes the couch:error event
     * @public
     * @method initializer
     * @see Y.Couch.Base#_defErrorFn
     */
    initializer : function () {
        this.publish(EVENT_ERROR, { defaultFn : this._defErrorFn });
    },
    
    /**
     * Returns the local data source or a new one based on the getNew param
     * @protected
     * @method _getDataSource
     * @param {Boolean} getNew
     * @returns Y.Couch.DataSource
     */
    _getDataSource : function (getNew) {
        
        if (getNew === true) {
            return this._newDataSource();
        }
        return this.get(DATA_SOURCE);
    },
    
    /**
     * Returns a new data source preset with the local attributes
     * @protected
     * @method _newDataSource
     * @returns Y.Couch.DataSource
     */
    _newDataSource : function () {
        return new Y.Couch.DataSource(this.getAttrs());
    },
    
    /**
     * Returns a new data source to be used for fetching external resources
     * @protected
     * @method _createDefaultDataSource
     * @see Y.Couch.Base#_newDataSource
     * @returns Y.Couch.DataSource
     */
    _createDefaultDataSource : function () {
        return this._newDataSource();
    },
    
    
    /**
     * Logs error messages when an error occurs
     * @protected
     * @method _defErrorFn
     * @param {Event} e
     */
    _defErrorFn : function (e) {
    }
    
}, {
    ATTRS : {
        
        /**
         * @attribute dataSource
         * @type Y.Couch.DataSource
         * @see Y.Couch.Base#_createDefaultDataSource
         */
        dataSource : {
            valueFn : '_createDefaultDataSource'
        }
    }
});


//overwrite stringify to support strings from booleans instead of ints
Y.QueryString._oldStringify = Y.QueryString.stringify;

Y.QueryString.stringify = function (obj, c, name) {

    if (IS_BOOLEAN(obj) || Object.prototype.toString.call(obj) === '[object Boolean]') {
        obj = obj.toString();
    }
    
    return Y.QueryString._oldStringify(obj, c, name);
};


}, '@VERSION@' ,{requires:['base-build','querystring','json','event','couch-datasource']});
YUI.add('couch-connect', function(Y) {

/**
 * Creates a connection to the CouchDB location. Provides access to a
 *   Y.Couch.DB
 * @module couch
 * @submodule couch-connect
 * @class Y.Couch.Connect
 * @extends Y.Couch.Base
 * @author Anthony Pipkin
 */

var LANG = Y.Lang,
    IS_STRING = LANG.isString,
    
    EVENT_ERROR = 'couch:error',
    EVENT_INFO = 'couch:info',
    EVENT_FETCH_ALL = 'couch:fetchAll';


Y.namespace('Couch').Connect = Y.Base.create('couch-base', Y.Couch.Base, [], {
    
    /**
     * Fired when a datasource fails. Logs an error message by default.
     * @event couch:error
     */
    
    /**
     * Fired when the datasource in fetchInfo fires successful. By default, will
     *   store the returned value from fetchInfo into ATTRS.info
     * @event couch:info
     */
    
    /**
     * Fired when the datasource in fetchAllDatabases fires successful. By
     *   default, will store the returned value from fetchInfo into ATTRS.databases
     * @event couch:fetchAll
     */
    
    /**
     * Publishes events and immediatly calls fetchInfo
     * @public
     * @method initializer
     * @param {Object} config
     * @see Y.Couch.DB#_defInfoFn
     * @see Y.Couch.DB#_deffFetchAllFn
     * @see Y.Couch.DB#fetchInfo
     */
    initializer : function () {
        this.publish(EVENT_INFO, { defaultFn : this._defInfoFn });
        this.publish(EVENT_FETCH_ALL, { defaultFn: this._defFecthAllFn });
        
        this.fetchInfo(true);
    },
    
    /**
     * Initializes a request to get the couch connection information.
     *   Fires couch:info on success and couch:error if there is an error.
     * @public
     * @method fetchInfo
     * @param getNew {Boolean} Uses the local datasource or creates a new object
     * @return Y.Couch.DataSource
     */
    fetchInfo : function (getNew) {
        var ds = this._getDataSource(getNew),
            callbacks = {
                
                success: Y.bind(function (e) {
                    this.fire(EVENT_INFO, {response: Y.JSON.parse(e.response.results[0].responseText)});
                }, this),
                
                failure: Y.bind(function (e) {
                    this.fire(EVENT_ERROR, {
                        message : 'An error occurred fetching the information: ' + e.error.message
                    });
                }, this)
                
            };
        
        ds.set('source', this.get('baseURI') + '/');
        
        ds.sendRequest({ callback : callbacks });
        
        return ds;
    },
    
    /**
     * Initializes a request to get an array of all the databases for the
     *   connection. Fires couch:fetchAll on success and couch:error if there
     *   is an error.
     * @public
     * @method fetchAllDatabases
     * @param getNew {Boolean} Uses the local datasource or creates a new object
     * @return Y.Couch.DataSource
     */
    fetchAllDatabases : function (getNew) {
        var ds = this._getDataSource(getNew),
            callbacks = {
                success: Y.bind(function (e) {
                    this.fire(EVENT_FETCH_ALL, {response: Y.JSON.parse(e.response.results[0].responseText)});
                }, this),
                
                failure: Y.bind(function (e) {
                    this.fire(EVENT_ERROR, {
                        message : 'An error occurred fetching the list of databases: ' + e.error.message
                    });
                }, this)
            };
        
        ds.set('source', this.get('baseURI') + '/_all_dbs');
        
        ds.sendRequest({ callback : callbacks });
        
        return ds;
    },
    
    /**
     * Returns a database object with the name provieded
     * @public
     * @method getDatabase
     * @param name {String} Name of the database for interaction
     * @returns Y.Couch.DB
     */
    getDatabase : function (name) {
        
        return (new Y.Couch.DB({
            baseURI : this.get('baseURI'),
            name: name
        }));
    },
    
    /**
     * Replicates a source database to the target.
     * @public
     * @method replicate
     * @param source {String} The source url to replicate from
     * @param target {String} The target url to replicate to
     * @param requestConfig {Object} Configuration object for replication options
     */
    
    /*
      TODO: Add in callback functions for even firing
    */
    replicate : function (source, target, requestConfig) {
        
        if (!IS_STRING(source) && !IS_STRING(target)) {
        }
        
        var ds = this._getDataSource(true);
        
        requestConfig = requestConfig || {};
        requestConfig.source = source;
        requestConfig.target = target;
        
        ds.set('source', this.get('baseURI') + '/_replicate');
        
        ds.sendRequest({
            cfg : {
                headers : {
                    'Content-Type' : 'application/json'
                },
                method : 'POST',
                data : requestConfig
            }
        });
    },
    
    /**
     * Concatenates val and ATTRS.name in the local _uri
     * @protected
     * @method _baseURISetter
     * @param {String} val
     * @returns {String} value to be stored in ATTRS.baseURI
     */
    _baseURISetter : function (val) {
        var length = val.length,
            lastChar = val.substring(length - 1);
        if (lastChar === '/') {
            val = val.substring(0, length - 1);
        }
        return val;
    },
    
    /**
     * Stores databases in ATTRS.databases after a couch:fetchAll event fires
     * @protected
     * @method _defFetchAllFn
     * @param {Event} e
     */
    _defFecthAllFn : function (e) {
        this._set('databases', e.response);
    },
    
    /**
     * Stores the connection information in ATTRS.info after a couch:info event
     *   fires
     * @protected
     * @method _defInfoFn
     * @param {Event} e
     */
    _defInfoFn : function (e) {
        this._set('info', e.response);
    }
    
}, {
    
    ATTRS : {
        
        /**
         * URI for CouchDB connection
         * @attribute baseURI
         * @type String
         * @see Y.Couch.DB#_baseURISetter
         */
        baseURI : {
            setter : '_baseURISetter'
        },
        
        /**
         * Array of databases for the CouchDB connection
         * @attribute database
         * @type Array
         * @readonly
         */
        databases : {
            value : [],
            readOnly : true
        },
        
        /**
         * Information stored from the latest fetchInfo call.
         * @attribute info
         * @type Object
         */
        info : {
            value : {},
            readOnly : true
        }
        
    }
    
});




}, '@VERSION@' ,{requires:['couch-base','couch-db']});
YUI.add('couch-datasource', function(Y) {

/**
 * A consistent interface for DataSource connections used in Y.Couch
 * @module couch
 * @submodule couch-datasource
 * @class Y.Couch.DataSource
 * @extends Y.DataSource.IO
 * @author Anthony Pipkin
 */

Y.namespace('Couch').DataSource = Y.Base.create('couch-datasource', Y.DataSource.IO, [], {
}, {
});




}, '@VERSION@' ,{requires:['datasource']});
YUI.add('couch-db', function(Y) {

/**
 * Creates a connection to the CouchDB database instance. Provides access to a
 *   Y.Couch.Document
 * 
 * @module couch
 * @submodule couch-db
 * @class Y.Couch.DB
 * @author Anthony Pipkin
 */

var EVENT_ERROR = 'couch:error',
    EVENT_INFO = 'couch:info',
    EVENT_FETCH_ALL = 'couch:fetchAll';

Y.namespace('Couch').DB = Y.Base.create('couch-db', Y.Couch.Base, [], {
    
    /**
     * Fired when a datasource fails. Logs an error message by default.
     * @event couch:error
     */
    
    /**
     * Fired when the datasource in fetchInfo fires successful. By default, will
     *   store the returned value from fetchInfo into ATTRS.info
     * @event couch:info
     */
    
    /**
     * Fired when the datasource in fetchAllDocuments fires successful. By
     *   default, will store the returned value from fetchAllDocuments into
     *   ATTRS.documents
     * @event couch:fetchAll
     */
    
    /**
     * The uri to the database. Built by setting ATTRS.baseURI and ATTRS.name 
     * @protected
     * @property _uri
     */
    _uri : '',
    
    /**
     * Publishes events and immediatly calls fetchInfo
     * @public
     * @method initializer
     * @param {Object} config
     * @see Y.Couch.DB#_defInfoFn
     * @see Y.Couch.DB#_deffFetchAllFn
     * @see Y.Couch.DB#fetchInfo
     */
    initializer : function (config) {
        this.publish(EVENT_INFO, { defaultFn : this._defInfoFn });
        this.publish(EVENT_FETCH_ALL, { defaultFn: this._defFecthAllFn });
        
        this.fetchInfo();
    },
    
    /**
     * Initializes a request to get the database information.
     *   Fires couch:info on success and couch:error if there is an error.
     * @public
     * @method fetchInfo
     * @return Y.Couch.DataSource
     */
    fetchInfo : function () {
        
        var ds = this._getDataSource(true),
            url = this._uri,
            callbacks = {
                
                success: Y.bind(function (e) {
                    this.fire(EVENT_INFO, {response: Y.JSON.parse(e.response.results[0].responseText)});
                }, this),
                
                failure: Y.bind(function (e) {
                    this.fire(EVENT_ERROR, {
                        message : 'An error occurred fetching the information for the databases: ' + e.error.message
                    });
                }, this)
            };
            
        ds.set('source', url);
        
        ds.sendRequest({
            cfg : {
                headers : {
                    'Content-Type' : 'application/json'
                },
                method : 'GET'
            },
            callback : callbacks
        });
        
        return ds;
    },
    
    /**
     * Initializes a request to get all documents for the database.
     *   Fires couch:fetchAll on success and couch:error if there is an error.
     * @public
     * @method fetchAllDocuments
     * @param {Object} <optional> options
     * @return Y.Couch.DataSource
     */
    fetchAllDocuments : function (options) {
        
        var ds = this._getDataSource(true),
            url = this._uri + '_all_docs',
            callbacks = {
                
                success: Y.bind(function (e) {
                    this.fire(EVENT_FETCH_ALL, {response: Y.JSON.parse(e.response.results[0].responseText)});
                }, this),
                
                failure: Y.bind(function (e) {
                    this.fire(EVENT_ERROR, {
                        message : 'An error occurred fetching the information for the databases: ' + e.error.message
                    });
                }, this)
            };
            
        ds.set('source', url);
        
        ds.sendRequest({
            cfg : {
                headers : {
                    'Content-Type' : 'application/json'
                },
                method : 'GET',
                data : options
            },
            callback : callbacks
        });
        
        return ds;
    },
    
    /**
     * Creates and returns a Y.Couch.Document instance with the baseURI,
     *   databaseName, and id set.
     * @public
     * @method getDocument
     * @param {Sring} id
     * @returns Y.Couch.Document
     */
    getDocument : function (id) {
        
        return new Y.Couch.Document({
            baseURI : this.get('baseURI'),
            databaseName : this.get('name'),
            id : id
        });
    },
    
    /**
     * Concatenates val and ATTRS.name in the local _uri
     * @protected
     * @method _baseURISetter
     * @param {String} val
     * @returns {String} value to be stored in ATTRS.baseURI
     */
    _baseURISetter : function (val) {
        this._uri = val + '/' + this.get('name') + '/';
        return val;
    },
    
    /**
     * Concatenates ATTRS.baseURI and val in the local _uri
     * @protected
     * @method _nameSetter
     * @param {String} val
     * @returns {String} value to be stored in ATTRS.name
     */
    _nameSetter : function (val) {
        this._uri = this.get('baseURI') + '/' + val + '/';
        return val;
    },
    
    /**
     * Stores the connection information in ATTRS.info after a couch:info event
     *   fires
     * @protected
     * @method _defInfoFn
     * @param {Event} e
     */
    _defInfoFn : function (e) {
        this._set('info', e.response);
    },
    
    /**
     * Stores documents after a couch:fetchAll event fires
     * @protected
     * @method _defFetchAllFn
     * @param {Event} e
     */
    _defFecthAllFn : function (e) {
        this._set('documents', e.response);
    }
    
}, {
    ATTRS : {
        
        /**
         * URI for CouchDB connection
         * @attribute baseURI
         * @type String
         * @see Y.Couch.DB#_baseURISetter
         */
        baseURI : {
            value : '',
            setter : '_baseURISetter'
        },
        
        /**
         * CouchDB database name
         * @attribute name
         * @type String
         * @see Y.Couch.DB#_nameSetter
         */
        name : {
            value : '',
            setter : '_nameSetter'
        },
        
        /**
         * Information stored from the latest fetchInfo call.
         * @attribute info
         * @type Object
         * @readonly
         */
        info : {
            readOnly : true
        },
        
        /**
         * Information stored from the latest fetchAllDocuments call.
         * @attribute documents
         * @type Object
         */
        documents : {
            readOnly : true
        }
    }
});



}, '@VERSION@' ,{requires:['couch-base','couch-document']});
YUI.add('couch-document', function(Y) {

/**
 * Creates a connection to a CouchDB document instance. Provides access to a
 *   Y.Couch.View
 * @module couch
 * @submodule couch-document
 * @class Y.Couch.Document
 * @author Anthony Pipkin
 */

var EVENT_ERROR = 'couch:error',
    EVENT_INFO = 'couch:info',
    EVENT_OPENED = 'couch:opened',
    EVENT_SAVED = 'couch:saved',
    EVENT_DELETED = 'couch:deleted';

Y.namespace('Couch').Document = Y.Base.create('couch-document', Y.Couch.Base, [], {
    
    /**
     * Fired when a datasource fails. Logs an error message by default.
     * @event couch:error
     */
    
    /**
     * Fired when the datasource in fetchInfo fires successful. By default, will
     *   store the returned value from fetchInfo into ATTRS.info
     * @event couch:info
     */
    
    /**
     * The uri to the document. Built by setting ATTRS.baseURI,
     *   ATTRS.databaseName and ATTRS.id
     * @protected
     * @property _uri
     */
    _uri : '',
    
    /**
     * Publishes events and immediatly calls fetchInfo
     * @public
     * @method initializer
     * @param {Object} config
     * @see Y.Couch.DB#_defInfoFn
     * @see Y.Couch.DB#_deffFetchAllFn
     * @see Y.Couch.DB#fetchInfo
     */
    initializer : function (config) {
        this.publish(EVENT_INFO, { defaultFn : this._defInfoFn });
        this.publish(EVENT_OPENED, { defaultFn: this._defOpenedFn });
        this.publish(EVENT_SAVED, { defaultFn: this._defSavedFn });
        this.publish(EVENT_DELETED, { defaultFn: this._defRemovedFn });
        
        this.fetchInfo();
    },
    
    /**
     * Initializes a request to get the couch document information.
     *   Fires couch:info on success and couch:error if there is an error.
     * @public
     * @method fetchInfo
     * @param getNew {Boolean} Uses the local datasource or creates a new object
     * @return Y.Couch.DataSource
     */
    fetchInfo : function () {
        
        var ds = this._getDataSource(true),
            url = this._uri,
            callbacks = {
                
                success: Y.bind(function (e) {
                    this.fire(EVENT_INFO, {response: Y.JSON.parse(e.response.results[0].responseText)});
                }, this),
                
                failure: Y.bind(function (e) {
                    this.fire(EVENT_ERROR, {
                        message : 'An error occurred fetching the information for the databases: ' + e.error.message
                    });
                }, this)
            };
            
        ds.set('source', url);
        
        ds.sendRequest({
            cfg : {
                headers : {
                    'Content-Type' : 'application/json'
                },
                method : 'GET'
            },
            callback : callbacks
        });
        
        return ds;
    },
    
    /**
     * Returns an array of views stored in ATTRS.info
     * @public
     * @method getAllViews
     * @returns {Array} 
     */
    getAllViews : function () {
        
        var info = this.get('info');
        
        if (!info || !info.views) {
            this.fire('EVENT_ERROR', {
                message : 'There is no information for this document available.'
            });
            return [];
        }
        
        return (Y.Object.keys(info.views));
    },
    
    /**
     * Returns a view object with the name provided and configuration object
     * @public
     * @method getView
     * @param name {String} Name of the database for interaction
     * @param config {Object} Provided for extra configurations to the view
     * @returns Y.Couch.View
     */
    getView : function (name, config) {
        
        config = config || {};
        config.name = name;
        config.baseURI = this._uri;
        
        return new Y.Couch.View(config);
    },
    
    /**
     * Opens a document with the name stored in ATTRS.name. Fires couch:opened
     *   on success and couch:error on failure.
     * @public
     * @method open
     * @param options {Object} URL options for opening the document
     * @return Y.Couch.DataSource
     */
    open : function (options) {
        
        var ds = this._getDataSource(true),
            url = this._uri,
            callbacks = {
                
                success: Y.bind(function (e) {
                    this.fire(EVENT_OPENED, {response: Y.JSON.parse(e.response.results[0].responseText)});
                }, this),
                
                failure: Y.bind(function (e) {
                    this.fire(EVENT_ERROR, {
                        message : 'An error occurred opening the document: ' + e.error.message
                    });
                }, this)
            };
            
        ds.set('source', url);
        
        ds.sendRequest({
            cfg : {
                headers : {
                    'Content-Type' : 'application/json'
                },
                method : 'GET',
                data: options
            },
            callback : callbacks
        });
        
        return ds;
    },
    
    /**
     * Saves the document with the provided options
     * TODO: clean up documentData before saving
     * @public
     * @method save
     * @param options {Object} URL options for saving the document
     * @return Y.Couch.DataSource
     */
    save : function (options) {
        
        var documentData = this.get('data'),
            ds = this._getDataSource(true),
            url = this._uri,
            callbacks = {
                
                success: Y.bind(function (e) {
                    this.fire(EVENT_SAVED, {response: Y.JSON.parse(e.response.results[0].responseText)});
                }, this),
                
                failure: Y.bind(function (e) {
                    this.fire(EVENT_ERROR, {
                        message : 'An error occurred opening the document: ' + e.error.message
                    });
                }, this)
            };
            
        if (!documentData || !documentData._id) {
            this.fire(EVENT_ERROR, {
                message : 'No data found on the document to save.'
            });
            return null;
        }
        
        url += encodeURIComponent(documentData._id);
        
        if (options !== undefined) {
            url += '?' + this._queryString( options );
        }
        
        ds.set('source', url);
        
        ds.sendRequest({
            cfg : {
                headers : {
                    'Content-Type' : 'application/json'
                },
                method : 'PUT',
                data : documentData
            },
            callback : callbacks
        });
        
        return ds;
    },
    
    /**
     * Removes a document with the stored ATTRS.name
     * TODO: Remove the document
     * @public
     * @method getDatabase
     * @param options {Object} URL options for removing the document
     */
    remove : function (options) {
    },
    
    /* DEF EVENT FN */
    
    /**
     * Stores information in ATTRS.info after a couch:info event fires
     * @protected
     * @method _defInfoFn
     * @param {Event} e
     */
    _defInfoFn : function (e) {
        this.set('info', e.response);
    },
    
    /**
     * Stores document information in ATTRS.data after a couch:opened event fires
     * @protected
     * @method _defOpenedFn
     * @param {Event} e
     */
    _defOpenedFn : function (e) {
        this._set('data', e.response);
    },
    
    /**
     * Method is called after couch:saved event fires
     * TODO: work with saved document resopnse
     * @protected
     * @method _defSavedFn
     * @param {Event} e
     */
    _defSavedFn : function (e) {
    },
    
    /**
     * Method is called after couch:removed event fires
     * TODO: work with removed document response
     * @protected
     * @method _defRemovedFn
     * @param {Event} e
     */
    _defRemovedFn : function (e) {
    },
    
    /* SETTERS */
    
    /**
     * Concatenates val, ATTRS.name and ATTRS.id in the local _uri
     * @protected
     * @method _baseURISetter
     * @param {String} val
     * @returns {String} value to be stored in ATTRS.baseURI
     */
    _baseURISetter : function (val) {
        this._uri = val + '/' + this.get('databaseName') + '/' + this.get('id');
        return val;
    },
    
    /**
     * Concatenates ATTRS.baseURI, val and ATTRS.id in the local _uri
     * @protected
     * @method _databaseNameSetter
     * @param {String} val
     * @returns {String} value to be stored in ATTRS.name
     */
    _databaseNameSetter : function (val) {
        this._uri = this.get('baseURI') + '/' + val + '/' + this.get('id');
        return val;
    },
    
    /**
     * Concatenates ATTRS.baseURI, ATTRS.databaseName and val in the local _uri
     * @protected
     * @method _idSetter
     * @param {String} val
     * @returns {String} value to be stored in ATTRS.id
     */
    _idSetter : function (val) {
        val = encodeURIComponent(val);
        this._uri = this.get('baseURI') + '/' + this.get('databaseName') + '/' + val;
        return val;
    }
}, {
    ATTRS : {
        
        /**
         * URI for CouchDB connection
         * @attribute baseURI
         * @type String
         * @see Y.Couch.DB#_baseURISetter
         */
        baseURI : {
            value : '',
            setter : '_baseURISetter'
        },
        
        /**
         * CouchDB database name
         * @attribute databaseName
         * @type String
         * @see Y.Couch.DB#_databaseNameSetter
         */
        databaseName : {
            value : '',
            setter : '_databaseNameSetter'
        },
        
        /**
         * CouchDB document ID
         * @attribute id
         * @type String
         * @see Y.Couch.DB#_idSetter
         */
        id : {
            value : '',
            setter : '_idSetter'
        },
        
        /**
         * Information stored from the latest fetchInfo call.
         * @attribute info
         * @type Object
         */
        info : {
            readOnly : true
        },
        
        /**
         * Opened document data
         * @attribute data
         * @type Object
         */
        data : {
            readOnly : true
        }
    }
});



}, '@VERSION@' ,{requires:['couch-base','couch-view']});
YUI.add('couch-view', function(Y) {

/**
 * Creates a connection to a CouchDB view.
 *   
 * @module couch
 * @submodule couch-view
 * @class Y.Couch.View
 * @author Anthony Pipkin
 */

var LANG = Y.Lang,
    IS_BOOLEAN = LANG.isBoolean,
    IS_NUMBER = LANG.isNumber,
    
    EVENT_ERROR = 'couch:error',
    EVENT_DATA = 'couch:data';


Y.namespace('Couch').View = Y.Base.create('couch-view', Y.Couch.Base, [], {
    
    /**
     * Fired when a datasource fails. Logs an error message by default.
     * @event couch:error
     */
    
    /**
     * Fired when the datasource in fetchData fires successful. By default, will
     *   store the returned value from fetchData into ATTRS.data
     * @event couch:data
     */
    
    /**
     * The uri to the view. Built by setting ATTRS.baseURI and ATTRS.name 
     * @protected
     * @property _uri
     */
    _uri : '',
    
    /**
     * Publish events
     * @public
     * @method initializer
     * @param config {Object} sets ATTRS
     */
    initializer : function(config) {
        this.publish(EVENT_DATA, { defaultFn: this._defDataFn });
    },
    
    /**
     * Initializes a request to get the couch view information.
     *   Fires couch:data on success and couch:error if there is an error.
     * @public
     * @method fetchData
     * @return Y.Couch.DataSource
     */
    fetchData : function () {
        
        var ds = this._getDataSource(true),
            url = this._uri,
            callbacks = {
                
                success: Y.bind(function (e) {
                    this.fire(EVENT_DATA, {
                        response: Y.JSON.parse(e.response.results[0].responseText)
                    });
                }, this),
                
                failure: Y.bind(function (e) {
                    this.fire(EVENT_ERROR, {
                        message : 'An error occurred fetching the information for the databases: ' + e.error.message
                    });
                }, this)
            },
            attrs = this.getAttrs(),
            requestData = {};
        
        // clean up ATTRS to prevent erroneous data in the request
        Y.Object.each(attrs, function(val, key, obj){
            if (val === null || val === undefined) {
                return;
            }
            
            if (
                key === 'baseURI' || key === 'name' || key === 'dataSource' ||
                key === 'destroyed' || key === 'initialized' || key === 'data'
            ) {
                return;
            }
            
            requestData[key] = val;
        });
        
        ds.set('source', url);
        
        ds.sendRequest({
            cfg : {
                headers : {
                    'Content-Type' : 'application/json'
                },
                method : 'GET',
                data : requestData
            },
            callback : callbacks
        });
        
        return ds;
    },
    
    /**
     * Concatenates val and ATTRS.name in the local _uri
     * @protected
     * @method _baseURISetter
     * @param {String} val
     * @returns {String} value to be stored in ATTRS.baseURI
     */
    _baseURISetter : function(val) {
        
        this._uri = val + '/_view/' + this.get('name');
        
        return val;
    },
    
    /**
     * Concatenates ATTRS.baseURI and val in the local _uri
     * @protected
     * @method _nameSetter
     * @param val {String} 
     * @returns {String} value to be stored in ATTRS.name
     */
    _nameSetter : function(val) {
        
        this._uri = this.get('baseURI') + '/_view/' + val;
        
        return val;
    },
    
    /**
     * Stores view data in ATTRS.data after a couch:data event fires
     * @protected
     * @method _defDataFn
     * @param {Event} e
     */
    _defDataFn : function (e) {
        this._set('data', e.response);
    }
    
}, {
    ATTRS : {
        
        /**
         * Full URI for the View's CouchDB Document.
         * @attribute baseURI
         * @type String
         * @see Y.Couch.DB#_baseURISetter
         */
        baseURI : {
            setter : '_baseURISetter'
        },
        
        /**
         * Name of the View to access
         * @attribute name
         * @type String
         * @see Y.Couch.DB#_nameSetter
         */
        name : {
            value : '',
            setter : '_nameSetter'
        },
        
        /**
         * Storage of most recent successful data request
         * @attribute data
         * @type Object
         */
        data : {},
        
        /**
         * Reverses the output. Also reverses the start and end keys.
         * @attribute descending
         * @type Boolean
         */
        descending : {
            value : false,
            validator : IS_BOOLEAN
        },
        
        /**
         * Specific key to end on. Must be a proper URL encoded JSON value.
         * @attribute endkey
         * @type String
         */
        endkey : {},
        
        /**
         * Last document id to include in the output (to allow pagination for
         *   duplicate endkeys)
         * @attribute endkey_docid
         * @type String
         */
        'endkey_docid' : {},
        
        /**
         * Controls whether the reduce function reduces to a set of distinct
         *   keys or to a single result row.
         * @attribute group
         * @type Boolean
         */
        group : {
            value : false,
            validator : IS_BOOLEAN
        },
        
        /**
         * Number of group keys to limit data returned.
         * @attribute group_level
         * @type String
         */
        'group_level' : {},
        
        /**
         * Automatically fetch and include the document which emitted each
         *   view entry
         * @attribute include_docs
         * @type Boolean
         */
        'include_docs' : {
            value : false,
            validator : IS_BOOLEAN
        },
        
        /**
         * Controls whether the endkey is included in the result.
         * @attribute inclusive_end
         * @type Boolean
         */
        'inclusive_end' : {
            value : true,
            validator : IS_BOOLEAN
        },
        
        /**
         * The actual key all results must match
         * @attribute key
         * @type String
         */
        key : {},
        
        /**
         * Limit the number of documents in the output
         * @attribute limit
         * @type Number
         */
        limit : {
            validotor : IS_NUMBER
        },
        
        /**
         * Specifies whether to use the reduce function of the view. 
         * @attribute reduce
         * @type Boolean
         */
        reduce : {
            validator : IS_BOOLEAN
        },
        
        /**
         * The number of documents to skip
         * @attribute skip
         * @type Number
         */
        skip : {
            value : 0,
            validator : IS_NUMBER
        },
        
        /**
         * When set to 'ok', CouchDB will not refresh the view to improve query
         *   latency. When set to 'update_after', CouchDB will refresh the view
         *   after the stale result is returned.
         * @attribute stale
         * @type String
         */
        stale : {
            validator : function(val){
                return (val === 'ok' || val === 'update_after');
            }
        },
        
        /**
         * Specific key to start with. Must be a proper URL encoded JSON value.
         * @attribute startkey
         * @type String
         */
        startkey : {},
        
        /**
         * Document ID to start with (to allow pagination for duplicate
         *   startkeys)
         * @attribute startkey_docid
         * @type String
         */
        'startkey_docid' :  {}
        
    }
});




}, '@VERSION@' ,{requires:['couch-base']});


YUI.add('couch', function(Y){}, '@VERSION@' ,{use:['couch-base', 'couch-connect', 'couch-db', 'couch-document', 'couch-view']});

