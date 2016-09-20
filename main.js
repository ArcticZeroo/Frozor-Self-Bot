/* General Requirements */
var log            = require('./logger/logger.js');
var package        = require('./package.json');
var fs             = require('fs');

/* Config Requirements */
var config         = require('./config/all.js');

/* Slack Requirements */
var slack_token    = config.slack.tokens.frozor;
var slackAPI       = require('./api/slack.js');
var slackBot       = slackAPI.createBot(slack_token);
var slackUtils     = require('./api/utils.js').getUtils(slackBot);
var slackCommands  = require('./commands/slack.js')(log);

/* Minecraft Requirements */
var MinecraftBot   = require('./minecraft/MinecraftBot');
var mf             = require('mineflayer');

/* Custom Class Requirements */
var CommandMessage = require('./objects/CommandMessage.js').slack;

log.logInfo(`${log.chalk.cyan(package.name)} version ${log.chalk.cyan(package.version)} active!`);

var selfBot        = new MinecraftBot(mf, config.minecraft.login.host, config.minecraft.login.port, config.minecraft.login.username, config.minecraft.login.password);

if(config.minecraft.TIME_LIMIT){
    setTimeout(()=>{
        log.logInfo(`${config.minecraft.MAX_TIME} seconds have elapsed, exiting process!`);
        selfBot.end();
        process.exit(0);
    }, config.minecraft.MAX_TIME*1000);
}

function startSlackBot(){
    slackBot.auth.test({},(response)=>{
        if(response.ok){
            log.logInfo("Successfully authenticated with Slack API!", "startSlackBot()");
            slackBot.rtm.start();
            registerEvents();
        }else{
            log.logError("Error starting slack _bot: " + response.error, "startSlackBot()");
        }
    });
}

function startBots(){
    startSlackBot();
    selfBot.initialize();
}

function registerEvents(){
    slackBot.on('hello', ()=>{
        log.logInfo(`Connected to RTM at ${log.chalk.magenta(slackBot.info.getTeamName())} as ${log.chalk.magenta(`${slackBot.info.getUserName()}@${slackBot.info.getUserID()}`)}`);
    });

    slackBot.on('message', (message)=>{
        //Sets a 'mention' property for the message object.
        message.mention = slackUtils.getUserMention(message.user);

        // Ensures that the _bot is not the one sending the message
        if(message.user == slackBot.info.getUserID()) return;

        // Checks to see if the message begins with _bot mention (which is command prefix)
        if(message.text.startsWith(slackBot.info.getUserMention())) slackBot.emit('command', message);
    });

    slackBot.on('command', (message)=>{
        var commandMessage = new CommandMessage(message);
        var command        = slackCommands.get(commandMessage.getName());

        if(!command) return;

        if(command.isAlias()) command = slackCommands.get(command.getAliasName());

        if(commandMessage.getArgs().length > command.getMax()) return slackUtils.chat.postMessage(commandMessage.getChannel(), `${commandMessage.getUser().getMention()} Too many arguments!`);
        if(commandMessage.getArgs().length < command.getMin()) return slackUtils.chat.postMessage(commandMessage.getChannel(), `${commandMessage.getUser().getMention()} Not enough arguments!`);

        command.getProcess()(selfBot, slackUtils, commandMessage);
    });

    selfBot.on('chat', (message)=>{
        slackUtils.chat.postMessage('chat', message);
    })
}

startBots();
