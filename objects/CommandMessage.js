var User = require('./User.js');

class SlackCommand{
    constructor(message){
        this._message = message;
        this._text    = message.text;
        this._args    = this._text.split(' ');
        this._channel = message.channel;
        this._user    = new User(message.user);
        this._name    = this._args[1];

        for(var arg in this._args) if(this._args[arg].trim() == '') args.splice(arg, 1);
        this._args.splice(0,2);
    }

    getMessage(){
        return this._message;
    }

    getChannel(){
        return this._channel;
    }

    getText(){
        return this._text;
    }

    getUser(){
        return this._user;
    }

    getName(){
        return this._name;
    }

    getArgs(){
        return this._args;
    }

    getArg(index){
        if(index > this._args.length-1) return null;
        return this.getArgs()[index];
    }
}

module.exports = {
    slack: SlackCommand
};