'use strict';

const
    abNative = require('ab-native'),
    js0 = require('js0'),

    abDatabaseNative = require('.'),

    DatabaseNativeError = require('./DatabaseNativeError')
;

class Database {
    static EscapeString(str) {
        return str.replace(/\'/g, '\'\'');
    }

    static UnescapeString(str) {
        return str;
    }

    static Quote(str) {
        return str
            .replace(/\\/g, "\\\\")
            .replace(/\'/g, "\\\'")
            .replace(/\"/g, "\\\"")
            .replace(/\n/g, "\\\n")
            .replace(/\r/g, "\\\r")
            .replace(/\x00/g, "\\\x00")
            .replace(/\x1a/g, "\\\x1a");
    }


    get initialized() {
        return this._initialized;
    }

    constructor() {
        this._initialized = true;
        this._lastError = null;

        let nad = new abNative.ActionsSetDef()
            // .addNative('GetAffectedRows', {

            // }, {
            //     affectedRows: [ 'int', js0.Null ],
            // })
            .addNative('GetIndexColumnInfos', {
                indexName: [ 'string' ],
                transactionId: [ 'int', js0.Null ],
            }, {
                indexColumnInfos: js0.Iterable(null),
            })
            .addNative('GetTableColumnInfos', {
                tableName: [ 'string' ],
                transactionId: [ 'int', js0.Null ],
            }, {
                columnInfos: js0.Iterable(null),
            })
            .addNative('GetTableIndexInfos', {
                tableName: [ 'string' ],
                transactionId: [ 'int', js0.Null ],
            }, {
                indexInfos: js0.Iterable(null),
            })
            .addNative('GetTableNames', {
                transactionId: [ 'int', js0.Null ],
            }, {
                tableNames: js0.Iterable('string'),
            })
            .addNative('Transaction_Finish', {
                commit: 'boolean',
                transactionId: 'int',
            }, null)
            .addNative('Transaction_IsAutocommit', null, {
                transactionId: [ 'int', js0.Null ],
            })
            .addNative('Transaction_Start', null, {
                transactionId: [ 'int', js0.Null ],
            })
            .addNative('Query_Execute', {
                query: 'string',
                transactionId: [ js0.Null, 'int', ],
            }, null)
            .addNative('Query_Select', {
                query: 'string',
                columnTypes: js0.Iterable('int'),
                transactionId: [ js0.Null, 'int', ],
            }, {
                rows: [ Array, js0.Null ],
            });
        this.nativeActions = abNative.addActionsSet('ABDatabase', nad);
    }

    async checkInit_Async() {
        if (!this._initialized)
            throw new Error('Database not initialized.');
    }

    async getIndexColumnInfos_Async(indexName, transactionId = null) {
        js0.args(arguments, 'string', [ 'int', js0.Null, js0.Default ]);
        
        await this.checkInit_Async();

        return (await this.nativeActions.callNative_Async(
                    'GetIndexColumnInfos', {
                transactionId: transactionId,
                indexName: indexName,
            })).indexColumnInfos;
    }

    getLastError() {
        return this._lastError;
    }

    async getTableColumnInfos_Async(tableName, transactionId = null) {
        js0.args(arguments, 'string', [ 'int', js0.Null, js0.Default ]);
        
        await this.checkInit_Async();

        return (await this.nativeActions.callNative_Async(
                    'GetTableColumnInfos', {
                transactionId: transactionId,
                tableName: tableName,
            })).columnInfos;
    }

    async getTableIndexInfos_Async(tableName, transactionId = null) {
        js0.args(arguments, 'string', [ 'int', js0.Null, js0.Default ]);
        
        await this.checkInit_Async();

        return (await this.nativeActions.callNative_Async(
                    'GetTableIndexInfos', {
                transactionId: transactionId,
                tableName: tableName,
            })).indexInfos;
    }

    async getTableNames_Async(transactionId = null) {
        js0.args(arguments, [ 'int', js0.Null, js0.Default ]);

        await this.checkInit_Async();

        return (await this.nativeActions.callNative_Async(
                'GetTableNames', { transactionId: transactionId }))
                .tableNames;
    }

    async transaction_Finish_Async(commit, transactionId) {
        js0.args(arguments, 'boolean', 'int');

        if (abDatabaseNative.debug)
            console.log('Debug: Transaction Finish', transactionId, new Error());

        await this.checkInit_Async();

        try {
            await this.nativeActions.callNative_Async(
                    'Transaction_Finish', 
                    { transactionId: transactionId, commit: commit });
        } catch (e) {
            throw new DatabaseNativeError(e);
        }
    }   

    async transaction_IsAutocommit_Async() {
        js0.args(arguments);

        await this.checkInit_Async();

        let result;
        try {
            result = await this.nativeActions.callNative_Async(
                    'Transaction_IsAutocommit');
        } catch (e) {
            throw new DatabaseNativeError(e);
        }

        return result.transactionId;
    }

    async transaction_Start_Async() {
        js0.args(arguments);

        if (abDatabaseNative.debug)
            console.log('Debug: Transaction Start', new Error());

        await this.checkInit_Async();

        let result;
        try {
            result = await this.nativeActions.callNative_Async(
                    'Transaction_Start')
        } catch (e) {
            throw new DatabaseNativeError(e);
        }

        if (abDatabaseNative.debug)
            console.log('Debug: Transaction Id', result.transactionId);

        return result.transactionId;
    }   

    async query_Execute_Async(query, transactionId = null) {
        js0.args(arguments, 'string', [ 'int', js0.Null, js0.Default ]);

        if (abDatabaseNative.debug)
            console.log('Debug: Query Execute -> ', query, new Error());

        await this.checkInit_Async();

        try {
            await this.nativeActions.callNative_Async('Query_Execute', 
                    { query: query, transactionId: transactionId, });
        } catch (e) {
            throw new DatabaseNativeError(e);
        }
    }   

    async query_Select_Async(query, columnTypes, transactionId = null) {
        js0.args(arguments, 'string', js0.Iterable('int'), [ 'int', 
                js0.Null, js0.Default ]);

        if (abDatabaseNative.debug)
            console.log('Debug: Query Execute -> ', query, new Error());

        await this.checkInit_Async();

        let result;
        try {
            result = await this.nativeActions.callNative_Async('Query_Select', 
                    { query: query, columnTypes: columnTypes, 
                    transactionId: transactionId, });
        } catch (e) {
            throw new DatabaseNativeError(e);
        }

        return result.rows;
    }
}
module.exports = Database;