var Hybrid      = require('frozor-hybrid');
var log         = require('frozor-logger');
var Error       = Hybrid.Objects.Error;
var Punishment  = Hybrid.Objects.Punish.Punishment;
var CommandUtil = Hybrid.Objects.CommandUtil;
var mf          = require('mineflayer');

var commands = {
    exit:{
        name: 'exit',
        args: {
            min: 0,
            max: 0
        },
        process: (slackBot, slackUtils, commandMessage, minecraftBot)=>{
            log.info(`Exiting Self-Bot due to ${log.chalk.cyan('exit')} Slack commandMessage...`);
            minecraftBot.end();
            commandMessage.sendAutoReply(slackUtils, `Goodbye!`, ()=>{
                process.exit();
            });
        }
    },
    end: {alias: 'exit'},
    chat:{
        name: 'chat',
        args: {
            min: 1,
            max: 100
        },
        process: (slackBot, slackUtils, commandMessage, minecraftBot)=>{
            minecraftBot.queueMessage(commandMessage.getArgs().join(' '));
        }
    },
    punish:{
        name: 'punish',
        args:{
            min: 4,
            max: 100
        },
        process: (slackBot, slackUtils, commandMessage, minecraftBot)=>{
            var user       = commandMessage.getArg(0);
            var type       = commandMessage.getArg(1).toUpperCase();
            var severity   = commandMessage.getArg(2);
            var reason     = commandMessage.getArgs().splice(3).join(' ');
            var punishment = new Punishment(user, type, severity, reason);

            punishment.punish(minecraftBot, (success, err)=>{
                if(!success){
                    if(err == Error.WINDOW_OPEN_TIMEOUT) return commandMessage.sendAutoReply(slackUtils, `Unable to punish *${user}* because the window did not open fast enough.`);
                    if(err == Error.WINDOW_WRONG_OPEN)   return commandMessage.sendAutoReply(slackUtils, `Unable to punish *${user}* because a different window opened.`);
                    if(err == Error.WINDOW_CLICK_ERROR)  return commandMessage.sendAutoReply(slackUtils, `Unable to punish *${user}* due to an issue when clicking the item.`);
                    if(err == Error.EVENT_ALREADY_BOUND) return commandMessage.sendAutoReply(slackUtils, `Unable to punish *${user}* because the \`windowOpen\` event is already bound.`);
                    return commandMessage.sendAutoReply(slackUtils, `Unable to punish *${user}* due to an unknown error: ${err}`);
                }
                if(type == 'UNBAN') return commandMessage.sendAutoReply(slackUtils, `Successfully unbanned *${user}* in slot \`${severity}\` with reason *${reason}*.`);
                commandMessage.sendAutoReply(slackUtils, `Successfully punished *${user}* for *${reason}*.`);
            });
        }
    },
    attack:{
        name: 'attack',
        args: {
            min: 0,
            max: 0
        },
        process: (slackBot, slackUtils, commandMessage, minecraftBot)=>{
            var stay = new mf.vec3(0.5, 42, 18);
            minecraftBot.getBot().physics.yawSpeed = 7.5;

            if(!minecraftBot.intervals) minecraftBot.intervals = {};

            commandMessage.sendAutoReply(slackUtils, `Beginning to move to the *Stay* point...`);
            log.info(`Moving to the ${log.chalk.cyan(`Stay`)} point...`);

            minecraftBot.getBot().lookAt(stay.offset(0, 1.5, 0));
            minecraftBot.getBot().setControlState('forward', true);

            minecraftBot.getBot().on('death', ()=>{
                clearInterval(minecraftBot.intervals.attack);
            });

            minecraftBot.getBot().on('health', ()=>{
                var Health_To_Use_Stew = 17;
                 if(minecraftBot.getBot().health < Health_To_Use_Stew){
                    var inventory = minecraftBot.getBot().inventory;
                    var foundItem = inventory.findInventoryItem(282, null);
                     if(foundItem){
                         if(minecraftBot.getBot().entity.metadata['8']) return;
                         var slot = 45-foundItem.slot;
                         log.debug(slot);
                         minecraftBot.getBot().setQuickBarSlot(slot);
                         minecraftBot.getBot().activateItem();
                         minecraftBot.getBot().deactivateItem();
                         minecraftBot.getBot().setQuickBarSlot(0);
                     }
                 }
            });

            minecraftBot.getBot().on('move', ()=>{
                var position = minecraftBot.getEntity().getPosition();
                if(stay.distanceTo(position) < 1){
                    minecraftBot.getBot().setControlState('forward', false);

                    function attackInterval(){
                        var entities = minecraftBot.getBot().entities;

                        var bestEntity    = null;
                        var bestDist      = null;
                        var closestEntity = null;
                        var closestDist   = null;

                        for(var entity in entities){
                            entity = entities[entity];

                            if(entity.type != 'mob') continue;

                            var distance = entity.position.distanceTo(minecraftBot.getEntity().getPosition());

                            if(!closestEntity || distance < closestDist){
                                closestEntity = entity;
                                closestDist   = distance;
                            }

                            if(!bestEntity || distance < bestDist){
                                bestEntity = entity;
                                bestDist   = distance;
                            }
                        }

                        if(bestEntity){
                            if(bestDist > 4.5 && bestDist < 15){
                                clearInterval(minecraftBot.intervals.attack);
                                minecraftBot.getBot().lookAt(bestEntity.position.offset(0, 2, 0));
                                minecraftBot.getBot().setQuickBarSlot(2);
                                minecraftBot.getBot().activateItem();
                                setTimeout(()=>{
                                    minecraftBot.getBot().deactivateItem();
                                    minecraftBot.getBot().setQuickBarSlot(0);
                                    minecraftBot.intervals.attack = setInterval(attackInterval, 75);
                                }, 1200);
                                return;
                            }
                            minecraftBot.getBot().lookAt(bestEntity.position.offset(0, 1.5, 0));
                            if(bestDist < 4.5) minecraftBot.getBot().attack(bestEntity, true);
                        }

                    }

                    minecraftBot.intervals.attack = setInterval(attackInterval, 75);

                    minecraftBot.getBot().removeAllListeners('move');

                    commandMessage.sendAutoReply(slackUtils, `Finished moving, started attacking entities.`);
                    log.info(`Finished moving, started attacking entities!`);
                }

            });
        }
    },
    stopattack:{
        name: 'stopattack',
        args: {
            min: 0,
            max: 0
        },
        process: (slackBot, slackUtils, commandMessage, minecraftBot)=>{
            minecraftBot.getBot().setControlState('forward', false);
            if(minecraftBot.intervals.attack){
                clearInterval(minecraftBot.intervals.attack);
                delete minecraftBot.intervals.attack;
                commandMessage.sendAutoReply(slackUtils, `Stopped attacking entities.`);
                log.info(`Stopped attacking entities.`);
            }else{
                commandMessage.sendAutoReply(slackUtils, `I wasn't attacking anything before... but now I definitely am not!`);
            }
        }
    },
    setloglevel:{
        name: 'setloglevel',
        args: {
            min: 1,
            max: 1
        },
        process: (slackBot, slackUtils, commandMessage, minecraftBot)=>{
            log.setLogLevel(commandMessage.getArg(0));
            log.info(`Log level has been set to ${commandMessage.getArg(0)}`);
        }
    },
    getpwindowitems:{
        name: 'getpwindowitems',
        args: {
            min: 0,
            max: 0
        },
        process: (slackBot, slackUtils, commandMessage, minecraftBot)=>{
            if(minecraftBot.listenerCount('windowOpen') > 0) return commandMessage.sendAutoReply(slackUtils, `Unable to get punishment window items because the event is already bound.`);

            minecraftBot.queueMessage(`/p ${minecraftBot.username} .`);
            minecraftBot.getBot().once('windowOpen', (window)=>{
                var windowOpened = false;

                setTimeout(()=>{
                    if(!windowOpened){
                        minecraftBot.removeAllListeners('windowOpen');
                        if(callback) return callback(false, Error.WINDOW_OPEN_TIMEOUT);
                    }
                }, 5000+(minecraftBot.getMessageQueue().length*1000));

                minecraftBot.once('windowOpen', (window)=>{
                    windowOpened = true;
                    if(window.title.indexOf("Punish") > -1){
                        try{
                            if(callback) return callback(true, window.slots);
                        }catch(e){
                            minecraftBot.closeWindow(window);
                            return callback(false, Error.WINDOW_CLICK_ERROR);
                        }
                    }else {
                        minecraftBot.removeAllListeners('windowOpen');
                        return callback(false, Error.WINDOW_WRONG_OPEN);
                    }
                });
            });
        }
    }
}

module.exports = new CommandUtil(commands);