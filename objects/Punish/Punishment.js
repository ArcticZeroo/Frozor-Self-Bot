var PunishSlots = require('./PunishSlots');
var Error       = require('../Error');

class Punishment{
    constructor(player, type, severity, reason){
        if(!reason) reason = "";

        this._player   = player;
        this._type     = type;
        this._severity = severity;
        this._reason   = reason;
        this._slot     = this._getSlot();
    }

    _getSlot(){
        if(!PunishSlots[this.getType()]) return null;
        if(!PunishSlots[this.getType()][this.getSeverity()]) return null;
        return PunishSlots[this.getType()][this.getSeverity()];
    }

    getPlayer(){
        return this._player;
    }

    getType(){
        return this._type;
    }

    getSeverity(){
        return this._severity;
    }

    getReason(){
        return this._reason;
    }

    getSlot(){
        return this._slot;
    }

    getPunishCommand(){
        return `/p ${this.getPlayer()} ${this.getReason()}`;
    }

    punish(minecraftBot, callback){
        if(minecraftBot.listenerCount('windowOpen') > 0) return callback(false, Error.EVENT_ALREADY_BOUND);

        var slot = this.getSlot();
        var windowOpened = false;

        minecraftBot.queueMessage(this.getPunishCommand());

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
                    minecraftBot.clickWindow(slot, 0, 0);
                    if(callback) return callback(true);
                }catch(e){
                    minecraftBot.closeWindow(window);
                    return callback(false, Error.WINDOW_CLICK_ERROR);
                }
            }else {
                minecraftBot.removeAllListeners('windowOpen');
                return callback(false, Error.WINDOW_WRONG_OPEN);
            }
        });
    }
}

module.exports = Punishment;