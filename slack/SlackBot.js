var EventEmitter   = require('events');
var SlackMessage   = require('../objects/SlackMessage');
var CommandMessage = require('../objects/CommandMessage');
var User           = require('../objects/User');
var log            = require('frozor-logger');
var slackAPI       = require('frozor-slack');
var slackCommands  = require('./commands/slack.js');

class SlackBot extends EventEmitter{
    constructor(token, minecraftBot){
        super();
        this._token        = token;
        this._bot          = null;
        this._utils        = null;
        this._minecraftBot = minecraftBot;
    }

    initialize(){
        this._bot   = slackAPI.createBot(this.getToken());
        this._utils = slackAPI.utils.getUtils(this._bot);

        this._bot.auth.test({}, (response)=>{
           if(response.ok) log.info(`Successfully authenticated with the Slack API!`);
            else log.error(`Unable to authenticate with Slack API: ${response.error}`);
        });

        this.registerEvents();
    }

    registerEvents(){
        var emitter = this.getBot();

        emitter.on('hello', ()=>{
            log.info(`Connected to RTM at ${log.chalk.magenta(this.getBot().info.getTeamName())} as ${log.chalk.magenta(`${this.getBot().info.getUserName()}@${this.getBot().info.getUserID()}`)}`);
        });

        emitter.on('message', (message)=>{
            message = new SlackMessage(message);

            //Checks to make sure that the sender is not the bot
            if(message.getUser() == this.getUserID()) return;

            // Checks to see if the message begins with _bot mention (which is command prefix)
            if(message.getText().startsWith(this.getMention())) emitter.emit('command', message);
        });

        emitter.on('command', (message)=>{
            var commandMessage = new CommandMessage(message);
            var command        = slackCommands.get(commandMessage.getName());

            //If the command is an alias, it the `command` object will be turned into the one for the alias.
            if(command.isAlias()) command = slackCommands.get(command.getAliasName());

            if(!command) return;

            //Ensures that the command has the correct amount of arguments
            if(commandMessage.getArgs().length > command.getMax()) return this.getUtils().chat.postMessage(commandMessage.getChannel(), `${commandMessage.getUser().getMention()} Too many arguments!`);
            if(commandMessage.getArgs().length < command.getMin()) return this.getUtils().chat.postMessage(commandMessage.getChannel(), `${commandMessage.getUser().getMention()} Not enough arguments!`);

            //Gets the command process and runs it.
            command.getProcess()(this.getBot(), this.getUtils(), commandMessage, this.getMinecraftBot());
        });

    }

    /**
     * @method - Use this before calling initialize() to change the registered events.
     * @param override_function - The function you want to override with. Must take no arguments, and can use anything inside the bot class.
     */
    overrideEvents(override_function){
        this.registerEvents = override_function;
    }

    getBot(){
        return this._bot;
    }

    getMinecraftBot(){
        return this._minecraftBot;
    }

    getToken(){
        return this._token;
    }
    
    getUtils(){
        return this._utils;
    }

    getUserName(){
        return this.getBot().info.getUserName();
    }

    getUserID(){
        return this.getBot().info.getUserID();
    }

    getUser(){
        return new User(this.getUserID());
    }

    getMention(){
        return this.getUser().getMention();
    }

    chat(channel, message, callback){
        this.getUtils().chat.postMessage(channel, message, true, {}, callback);
    }
}

module.exports = SlackBot;