/**
 * Created by julia on 01.11.2016.
 */
var CmdManager = require('./modules/cmdManager');
var LanguageManager = require('./modules/langManager');
var serverModel = require('./DB/server');
var CMD;
var LANG;
var config = require('./config/main.json');
var winston = require('winston');
var raven = require('raven');
var client = new raven.Client(config.sentry_token);
var Discord = require("discord.js");
var options = {
    messageCacheMaxSize: 2500,
    disableEveryone: true,
    fetchAllMembers: true,
    disabledEvents: ['typingStart', 'typingStop']
};
winston.info(options);
var bot = new Discord.Client(options);

if (!config.beta) {
    client.patchGlobal(() => {
        winston.error('Oh no I died!');
        process.exit(1);
    });
}
bot.on('ready', () => {
    LANG = new LanguageManager();
    CMD = new CmdManager(LANG);
    CMD.on('ready', (cmds) => {
        console.log('commands are ready!');
        // console.log(cmds);
    });
});
// bot.on('debug', info => winston.info('Debug:' + info));
bot.on("message", (msg) => {
    CMD.check(msg);
});
bot.on('guildCreate', (Guild) => {
    serverModel.findOne({id: Guild.id}, (err, server) => {
        if (err) return winston.error(err);
        if (server) {

        } else {
            let server = new serverModel({
                id: Guild.id,
                nsfwChannels: [],
                cmdChannels: [],
                lastVoiceChannel: "",
                levelEnabled: true,
                pmNotifications: true,
                chNotifications: false,
                prefix: "!w."
            });
            server.save((err) => {
                if (err) return winston.info(err);
            });
        }
    });
});
bot.on('guildMemberAdd', (member) => {

});
bot.on('guildMemberRemove', (member) => {

});
bot.login(config.token).then(winston.info('Logged in successfully'));