class Command{
    constructor(json){
        this._json    = json;
        this._name    = json.name;
        this._args    = json.args;
        this._process = json.process;
        this._alias   = json.alias;
    }

    isAlias(){
        if(this._alias) return true;
        return false;
    }

    getAliasName(){
        return this._alias;
    }

    getJSON(){
        return this._json;
    }

    getName(){
        return this._name;
    }

    getArgs(){
        return this._args;
    }

    getMax(){
        return this._args.max;
    }

    getMin(){
        return this._args.min;
    }

    getProcess(){
        return this._process;
    }
}

module.exports = Command;