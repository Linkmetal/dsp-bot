'use strict';
var Command = require('../../lib/command.js'),
    config = require('../../lib/ConfigManager.js').config;

var prefix = config.settings.prefix,
    commandName = 'leave';

var help = `**${commandName.toUpperCase()}**
_Makes the DSP-BOT leave your current voice channel._

Usage:
    ${prefix}${commandName}
    ${prefix}${commandName} -h | --help

Options:
    -h --help   _Shows this screen_`;

var commandProperties = {
    name: commandName,
    description: 'Do the DSP bot leave your voice channel',
    help: help,
    level: 3,
    fn: doLeave
};

var command = new Command(commandProperties);

function doLeave(message, client) {
    const messageVoiceChannel = message.member.voiceChannel;
    const connection = client.voiceConnections.first();
    
    if (connection && connection.channel.id === messageVoiceChannel.id) {
        connection.disconnect();
    } else {
        throw new Error('I\'m not in your voice channel!');
    }
}

module.exports = command;
