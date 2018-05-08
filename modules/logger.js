const w = require('winston');
const {existsSync, writeFileSync} = require('fs');
const {join} = require('path');

const errorLogFilePath = join(__dirname, '..', 'logs', 'errors.log');

if (!existsSync(errorLogFilePath)) {
    writeFileSync(errorLogFilePath, '');
}

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
