/* Require the actual API */
var Hybrid         = require('frozor-hybrid');

/* General Requirements */
var log            = require('frozor-logger');
var package        = require('./package.json');
var Hybrid         = require('../slack-mc-hybrid/');
var fs             = require('fs');

/* Config Requirements */
var config         = require('./config/config');

/* Slack Requirements */
const slack_token  = config.slack.tokens.frozor;
var SlackBot       = Hybrid.SlackBot;
var slackAPI       = require('frozor-slack');
var slackBot       = slackAPI.createBot(slack_token, true);
var slackUtils     = slackAPI.utils.getUtils(slackBot);
var slackCommands  = Hybrid.Commands.Slack;

/* Minecraft Requirements */
var MinecraftBot   = Hybrid.MinecraftBot;
var mf             = require('mineflayer');

/* Custom Class Requirements */
var CommandMessage = Hybrid.Objects.CommandMessage.slack;

log.info(`${log.chalk.cyan(package.name)} version ${log.chalk.cyan(package.version)} active!`, 'SELF|MAIN');

var selfBot        = new MinecraftBot(mf, config.minecraft.login.host, config.minecraft.login.port, config.minecraft.login.username, config.minecraft.login.password);
var slackBot       = new SlackBot(slack_token, selfBot);

function startBots(){
    slackBot.initialize();
    registerEvents();
}

function registerEvents(){
    slackBot.on('hello', ()=>{
        selfBot.initialize();
    });

    slackBot.on('command', (args)=>{
       args.command.getProcess()(slackBot, slackUtils, args.message, selfBot);
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
//TODO: Consider all messages in chat channel to be chat
//TODO: Remove main.js from the rest of the project, create SlackMC Module