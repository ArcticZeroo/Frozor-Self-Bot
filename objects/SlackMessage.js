var User = require('./User');

class SlackMessage{
    constructor(message){
        this._message = message;
        this._user    = message.user;
        this.user     = new User(this._user);
        this._text    = message.text;
        this._channel = message.channel;
        this._ts      = message.ts;
        this._subtype = message.subtype;
    }

    /**
     * @returns {string}
     */
    getText(){
        return this._text;
    }

    /**
     * @returns {string}
     */
    getChannel(){
        return this._channel;
    }

    /**
     * @returns {User}
     */
    getUser(){
        return this.user;
    }

    /**
     *
     * @returns {number}
     */
    getTimestamp(){
        return this._ts;
    }

    /**
     *
     * @returns {*}
     */
    getSubtype(){
        return this._subtype;
    }

    /**
     *
     * @returns {boolean}
     */
    hasSubtype(){
        if(this.getSubtype()) return true;
        return false;
    }

    mention(){
        return this.getUser().getMention();
    }
}

module.exports = SlackMessage;