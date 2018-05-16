const w = require('winston');
const {existsSync, writeFileSync} = require('fs');
const {join} = require('path');

/**
 * Logger module to keep track and log errors.
 * @module modules/logger
 * @requires winston
 * @requires fs
 * @requires path
 */

const errorLogFilePath = join(__dirname, '..', 'logs', 'errors.log');

//Creates a new file to errorLogFilePath or if it exits clear all contents.
writeFileSync(errorLogFilePath, '');

/**
 * Logger Object that is setted to log errors.
 *
 * @alias module:modules/logger.errorLogger
 * @const
 * @type {Object}
 */
const errorLogger = new w.Logger({
    level: 'error',
    transports: [
        new w.transports.Console(),
        new w.transports.File({
            filename: errorLogFilePath,
            json: true,
            prettyPrint: true
        })
    ]
});

module.exports = errorLogger;
