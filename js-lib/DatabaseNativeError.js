'use strict';

class DatabaseNativeError extends Error {
    constructor(message) {
        super(message);

        this.name = 'DatabaseNativeError';
    }
    
}
module.exports = DatabaseNativeError;