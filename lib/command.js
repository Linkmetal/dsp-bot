'use strict';
var config = require('../config.json'),
    logger = require('../lib/logger.js');

function Command(options) {
    var defaultOpts = {
        name: 'default',
        description: 'Default description',
        help: 'Default text for help command',
        level: 0, //0 all, 1: member, 2: officer, 3: owner
        fn: noop
    };
    var properties = {};
    Object.assign(properties, defaultOpts, options);
    this.properties = properties;
    this.execute = execute;

    function noop() {}

    function execute(message, paramString) {
        if (!isAllowedExecute(message.author.id, properties.level)) {
            logger.warn(`User "${message.author.username}" attempted to execute command "${properties.name}", but has insufficient permissions level (${properties.level})`);
            throw new Error('You are not allowed to execute this command');
        }
        var args = new CommandArgs();
        args.setFromString(paramString);
        logger.debug(`Command "${properties.name}" executed by "${message.author.username}" with args "${paramString}"`);
        var client = message.client;
        if (args.options['h'] || args.flags['help']) {
            return client.reply(message, properties.help);
        }
        return properties.fn(message, client, args);
    }
}

function isAllowedExecute(userId, level) {
    level--;
    if (level < 0) {
        return true;
    }
    var found = false;
    var len = config.permissions.length;
    for (var i = level; i < len; i++) {
        found = config.permissions[i].find(function(id) {
            return id === userId;
        });
        if (found) {
            break;
        }
    }
    return found;
}

var CommandArgs = function CommandArgs() {
    var self = this;
    this.options = {};
    this.flags = {};
    this.params = [];

    this.setFromString = function setFromString(string) {
        var temp = string.split('"');
        temp.forEach(function(val, index) {
            val = val.trim();
            if (val.replace(/\s/g, '')) {
                var regexFlag = new RegExp('(--\.+=\.+|--\.+)');
                var regexOption = new RegExp('(-\.)');
                //if is flag, an option or a param
                if (regexFlag.test(val)) {
                    var splitArr = val.split('=');
                    var flagname = splitArr[0].substring(2);
                    var flagValue = splitArr[1] || true;
                    self.flags[flagname] = flagValue;
                } else if (regexOption.test(val)) {
                    self.options[val.substring(1)] = true;
                } else {
                    self.params.push(val);
                }
            }
        });
    };
};

module.exports = Command;