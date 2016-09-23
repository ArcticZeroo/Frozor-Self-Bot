var CommandUtil = require('./CommandUtil');
var Punishment  = require('../objects/Punish/Punishment');
var Error       = require('../objects/Error');
var log         = require('frozor-logger');

var commands = {
    exit:{
        name: 'exit',
        args: {
            min: 0,
            max: 0
        },
        process: (slackBot, slackUtils, command, minecraftBot)=>{
            log.info(`Exiting Self-Bot due to ${log.chalk.cyan('exit')} Slack command...`);
            minecraftBot.end();
            slackUtils.chat.postMessage(command.getChannel(), `${command.getUser().getMention()} Goodbye!`, ()=>{
                process.exit();
            });
        }
    },
    chat:{
        name: 'chat',
        args: {
            min: 1,
            max: 100
        },
        process: (slackBot, slackUtils, command, minecraftBot)=>{
            minecraftBot.queueMessage(command.getArgs().join(' '));
        }
    },
    punish:{
        name: 'punish',
        args:{
            min: 4,
            max: 100
        },
        process: (slackBot, slackUtils, command, minecraftBot)=>{
            var user       = command.getArg(0);
            var type       = command.getArg(1).toUpperCase();
            var severity   = command.getArg(2);
            var reason     = command.getArgs().splice(3).join(' ');
            var punishment = new Punishment(user, type, severity, reason);

            punishment.punish(minecraftBot, (success, err)=>{
                if(!success){
                    if(err == Error.WINDOW_OPEN_TIMEOUT) return slackUtils.chat.postMessage(command.getChannel(), `${command.getUser().getMention()} Unable to punish *${user}* because the window did not open fast enough.`);
                    if(err == Error.WINDOW_WRONG_OPEN)   return slackUtils.chat.postMessage(command.getChannel(), `${command.getUser().getMention()} Unable to punish *${user}* because a different window opened.`);
                    if(err == Error.WINDOW_CLICK_ERROR)  return slackUtils.chat.postMessage(command.getChannel(), `${command.getUser().getMention()} Unable to punish *${user}* due to an issue when clicking the item.`);
                    if(err == Error.EVENT_ALREADY_BOUND) return slackUtils.chat.postMessage(command.getChannel(), `${command.getUser().getMention()} Unable to punish *${user}* because the \`windowOpen\` event is already bound.`);
                    return slackUtils.chat.postMessage(command.getChannel(), `${command.getUser().getMention()} Unable to punish *${user}* due to an unknown error: ${err}`);
                }
                if(type == 'UNBAN') return slackUtils.chat.postMessage(command.getChannel(), `${command.getUser().getMention()} Successfully unbanned *${user}* in slot \`${severity}\` with reason *${reason}*.`);
                slackUtils.chat.postMessage(command.getChannel(), `${command.getUser().getMention()} Successfully punished *${user}* for *${reason}*.`);
            });
        }
    }

}

module.exports = new CommandUtil(commands);