'use strict';

const
    js0 = require('js0'),

    Database = require('./Database'),
    DatabaseNativeError = require('./DatabaseNativeError')
;

class abDatabaseNative_Class {
    get Database() {
        return Database;
    }

    get DatabaseNativeError() {
        return DatabaseNativeError;
    }

    get debug() {
        return this._debug;
    }


    setDebug(debug) {
        js0.args(arguments, 'bool');
        this._debug = debug;
    }
}
export default abDatabaseNative = new abDatabaseNative_Class();