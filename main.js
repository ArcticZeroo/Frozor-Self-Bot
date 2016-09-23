/* General Requirements */
var log            = require('frozor-logger');
var package        = require('./package.json');
var fs             = require('fs');

/* Config Requirements */
var config         = require('./config/all.js');

/* Slack Requirements */
var slack_token    = config.slack.tokens.frozor;
var SlackBot       = require('./slack/SlackBot');
const slack_token  = config.slack.tokens.frozor;
var slackAPI       = require('frozor-slack');
var slackBot       = slackAPI.createBot(slack_token);
var slackUtils     = slackAPI.utils.getUtils(slackBot);
var slackCommands  = require('./commands/slack.js');

/* Minecraft Requirements */
var MinecraftBot   = require('./minecraft/MinecraftBot');
var mf             = require('mineflayer');

/* Custom Class Requirements */
var CommandMessage = require('./objects/CommandMessage.js').slack;

log.logInfo(`${log.chalk.cyan(package.name)} version ${log.chalk.cyan(package.version)} active!`);

var selfBot        = new MinecraftBot(mf, config.minecraft.login.host, config.minecraft.login.port, config.minecraft.login.username, config.minecraft.login.password);
var slackBot       = new SlackBot(slack_token, selfBot);

if(config.minecraft.TIME_LIMIT){
    setTimeout(()=>{
        log.logInfo(`${config.minecraft.MAX_TIME} seconds have elapsed, exiting process!`);
        selfBot.end();
        process.exit(0);
    }, config.minecraft.MAX_TIME*1000);
}

function startBots(){
    slackBot.initialize();
    selfBot.initialize();
    registerEvents();
}

function registerEvents(){
    selfBot.on('chat', (message)=>{
        slackBot.chat('chat', message);
    });
}

startBots();
