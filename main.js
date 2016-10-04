/* Require the actual API */
var Hybrid         = require('frozor-hybrid');

/* General Requirements */
var log            = require('frozor-logger');
var package        = require('./package.json');
var fs             = require('fs');

/* Config Requirements */
var config         = require('./config/config');

/* Slack Requirements */
const slack_token  = config.slack.tokens.frozor;
var SlackBot       = require('frozor-slackbot');
var slackAPI       = require('frozor-slack');
var slackBot       = new SlackBot(slack_token);
var slackUtils     = null;
var slackCommands  = null;

/* Minecraft Requirements */
var MinecraftBot   = require('frozor-minecraftbot');
var mf             = require('mineflayer');

/* Custom Module Requirements */
var Error          = Hybrid.Objects.Error;
var CommandMessage = Hybrid.Objects.CommandMessage.slack;
var RunCommand     = Hybrid.Commands.RunCommand;

log.info(`${log.chalk.cyan(package.name)} version ${log.chalk.cyan(package.version)} active!`, 'SELF|MAIN');

var selfBot        = new MinecraftBot(mf, config.minecraft.login.host, config.minecraft.login.port, config.minecraft.login.username, config.minecraft.login.password);

function startBots(){
    slackBot.initialize();
    slackUtils = slackAPI.utils.getUtils(slackBot.getBot());
    registerEvents();
}

function registerEvents(){
    slackBot.on('hello', ()=>{
        slackCommands = require('./commands/slack');
        selfBot.initialize();
    });

    slackBot.on('message', (slackMessage)=>{
        if(slackMessage.getUser().getID() == slackBot.getUser().getID())       return;
        if(!slackMessage.getText())                                            return;
        if(slackMessage.getText().startsWith(slackBot.getUser().getMention())) return;

        if(slackMessage.getChannel() != config.slack.channels.chat.id) return;

        var message = slackMessage.getMessage();

        message.text = `chat ${slackMessage.getText()}`;

        var commandMessage = new CommandMessage(message, 0);

        slackBot.emit('command', commandMessage);
    })

    slackBot.on('command', (commandMessage)=>{
        RunCommand.run(commandMessage, slackCommands, (command, err)=>{
            if(err){
                switch(err){
                    case Error.COMMAND_UNDEFINED:
                        log.debug(`Undefined command entered.`);
                        break;
                    case Error.COMMAND_TOO_MANY_ARGS:
                        commandMessage.sendAutoReply(slackUtils, `Too many arguments! That command has a maximum of ${command.getMax()}`);
                        break;
                    case Error.COMMAND_NOT_ENOUGH_ARGS:
                        commandMessage.sendAutoReply(slackUtils, `Not enough arguments! That command has a minimum of ${command.getMin()}`);
                        break;
                    default:
                        commandMessage.sendAutoReply(slackUtils, `An unknown error has occurred. Please try again later.`);
                }
                return;
            }

            var process = command.getProcess();

            try{
                process(slackBot, slackUtils, commandMessage, selfBot);
            }catch(e){
                commandMessage.sendAutoReply(slackUtils, `Unable to process command, please try again later.`);
                log.error(`An error occurred while attempting to execute the command ${log.chalk.red(commandMessage.getName())}: ${e}`);
            }
        });
    });

    selfBot.on('chat', (message)=>{
        slackBot.chat('chat', message);
    });

    selfBot.on('login', ()=>{
        if(config.minecraft.TIME_LIMIT){
            setTimeout(()=>{
                log.info(`${config.minecraft.MAX_TIME} seconds have elapsed, exiting process!`, 'SELF');
                selfBot.end();
                process.exit(0);
            }, config.minecraft.MAX_TIME*1000);
        }
    });
}

startBots();

//TODO: Self token which deletes own messages