var r = require('request');
var WebSocketClient = require('websocket').client;
var socket = new WebSocketClient();
var EventEmitter = require('events');
var log = require("../logger/logger.js");

var base_url = "https://slack.com/api/";

class Info{
    setUserID(id){
        this.userID = id;
    }
    getUserID(){
        return this.userID;
    }

    getUserMention(){
        return `<@${this.getUserID()}>`;
    }

    setUserName(name){
        this.userName = name;
    }
    getUserName(){
        return this.userName;
    }
    setTeamID(id){
        this.teamID = id;
    }
    getTeamID(){
        return this.teamID;
    }

    setTeamName(name){
        this.teamName = name;
    }
    getTeamName(){
        return this.teamName;
    }
}

class Utils{
    constructor(token){
        this.token = token;
        //console.log("Token: " + token)
        this.rtm;
    }

    getToken(){
        //console.log(`Token has been requested, returning ${this.token}`);
        return this.token;
    }

    stringifyIfNecessary(object){
        if(typeof object != "string") return JSON.stringify(object);
        return object;
    }

    encodeAndStringify(object){
        return encodeURIComponent(this.stringifyIfNecessary(object));
    }

    createSlackRequestURL(method, args){
        var request_url = `${base_url}${method}`;
        if(!args) return request_url;

        var request_args = [];

        if(args.token == true) request_args.push(`token=${this.getToken()}`);
        if(args.token != undefined) delete args.token;

        for(var arg in args) if(args[arg]) request_args.push(`${arg}=${this.encodeAndStringify(args[arg])}`);

        if(request_args.length > 0) request_url = `${base_url}${method}?${request_args.join("&")}`;

        //if(method == "chat.postMessage") log.logDebug(request_url);

        return request_url;
    }

    get(url, callback){
        //console.log("Making request at url " + url);
        r(url, (error, response, body) =>{
            if(!error && body != ''){
                try{var bodyParse = JSON.parse(body);}catch(e){return log.logError(`Unable to parse request body for URL ${url}: ${e}`);}
                if(bodyParse.ok == false || bodyParse.error){
                    log.logError(`An error was returned by the recipient: ${bodyParse.error}`);
                }
                //log.logDebug(body);
                callback(bodyParse);
            }else if(error){
                if (callback) callback({
                    ok: false,
                    error: error
                });
                log.logError(`Request returned an error: ${error}`, "slack/Utils.get()");
            }else{
                if (callback) callback({
                    ok: false,
                    error: "An unexpected error occurred. Please try again later."
                });
            }
        });
    }

    makeRequest(method, args, callback){
        var request_url = this.createSlackRequestURL(method, args);
        //log.logDebug(request_url);
        this.get(request_url, (body)=>{
            if(!callback) return;
            callback(body);
        });
    }

}

class Events extends EventEmitter{
    constructor(api_emitter){
        super();
        this.emitter = api_emitter;
    }

    emitEvent(event){
        event = JSON.parse(event);

        this.emit(event.type, event);
        this.emit('all', event);

        this.emitter.emit(event.type, event);
        this.emitter.emit('all', event);
    }
}

class API{
    constructor(utils){
        this.utils = utils;
    }

    test(args, callback){
        //Tests to make sure the API works properly.
        //error: Error response to return
        //foo: example property to return
        args = args || {};
        return this.utils.makeRequest("api.test", args, callback);
    }
}

class Auth{
    constructor(utils){
        this.utils = utils;
    }

    revoke(args, callback){
        //Revokes access to a token.
        //token: Auth token
        //test: Setting to 1 triggers testing mode where it's NOT revoked.
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("auth.revoke", args, callback);
    }
    test(args, callback){
        //This method checks authentication and tells you who you are.
        //token: Auth token
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("auth.test", args, callback);
    }
}

class Bots{
    constructor(utils){
        this.utils = utils;
    }

    info(args, callback){
        //This method returns information about a _bot user.
        //token: Auth token
        //_bot: Bot user to get info on
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("bots.info", args, callback);
    }
}

class Channels{
    constructor(utils){
        this.utils = utils;
    }

    archive(args, callback){
        //This method archives a channel.
        //token:   Auth token
        //channel: Channel to archive
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("channels.archive", args, callback);
    }
    create(args, callback){
        //This method is used to create a channel.
        //token:     Auth token
        //name:      Name of channel to create
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("channels.create", args, callback);
    }
    history(args, callback){
        //This method returns a portion of message events from the specified channel.
        //token:     Auth token
        //channel:   ID of the channel to get history for
        //latest:    end of time range of messages to include in results
        //oldest:    start of time range of messages to include in results
        //inclusive: include messages of either timestamp in results
        //count:     number of messages to return (0-1000)
        //unreads:   include unread_count_display in the output?
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("channels.history", args, callback);
    }
    info(args, callback){
        //This method returns information about a team channel.
        //token:     Auth token
        //channel:   ID of the channel to get info for
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("channels.info", args, callback);
    }
    invite(args, callback){
        //This method is used to invite a user to a channel. The calling user must be a member of the channel.
        //token:     Auth token
        //channel:   ID of the channel
        //user:      User to invite to the channel
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("channels.invite", args, callback);
    }
    join(args, callback){
        //This method is used to join a channel. If the channel does not exist, it is created.
        //token:     Auth token
        //name:      Name of the channel to join
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("channels.info", args, callback);
    }
}

class Chat{
    constructor(utils){
        this.utils = utils;
    }

    postMessage(args,callback){
        args = args || {};
        args.token = true;

        if(args.text.length > 2999){
            var queue = [];

            var message = args.text;

            while(message.length > 2999){
                var temp_args   = JSON.parse(JSON.stringify(args));
                var textSub     = message.substring(0, 3000);
                temp_args.text  = textSub;
                queue.push(temp_args);
                message         = message.substring(3000);
            }
            if(message.length > 0){
                var temp_args   = args;
                temp_args.text  = message;
                queue.push(temp_args);
            }

            function sendNext(utils){
                var toSend = queue.splice(0,1)[0];
                toSend.token = true;
                utils.makeRequest("chat.postMessage", toSend, ()=>{if(queue.length > 0){sendNext(utils)}});
            }

            sendNext(this.utils);
        }else this.utils.makeRequest("chat.postMessage", args, callback);
    }
    delete(args,callback){
        args = args || {};
        args.token = true;

        return this.utils.makeRequest("chat.delete", args, callback);
    }
    meMessage(args,callback){
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("chat.meMessage", args, callback);
    }
    update(args,callback){
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("chat.update", args, callback);
    }
}

class Reactions{
    constructor(utils){
        this.utils = utils;
    }

    add(args, callback){
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("reactions.add", args, callback);
    }
}

class RTM extends EventEmitter {
    constructor(token, events, info, utils){
        super();
        this.token  = token;
        this.events = events;
        this.info   = info;
        this.utils  = utils;
    }

    start(args){
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("rtm.start", args, (response)=>(this.init(response)));
    }

    init(response){
        if(response.url){
            this.info.setUserID(response.self.id);
            this.info.setUserName(response.self.name);
            this.info.setTeamID(response.team.id);
            this.info.setTeamName(response.team.name);
            this.connect(response.url);
        }
    }

    connect(url){
        log.logInfo("Connecting to RTM server...", "slack/RTM::connect()");
        socket.connect(url);
        socket.on('connect', (connection)=>{
            log.logInfo('Connected to RTM socket!', "slack/RTM::connect()");
            connection.on('message', (message)=>{
                if(message.type == 'utf8') this.events.emitEvent(message.utf8Data);
            });
            connection.on('error', (error)=>{
                log.logError("Error in connection to RTM server: " + error + ", restarting RTM", "slack/RTM.connect()");
                this.connect(url);
            });
            connection.on('close', ()=>{
                log.logInfo("Rtm connection closed. Restarting RTM", "slack/RTM.connect()");
                this.connect(url);
            });
            connection.on('connectFailed', ()=>{
                log.logInfo("Unable to connect to RTM. Retrying in 10 seconds...", "slack/RTM.connect()");
                setTimeout(()=>{this.connect(url)}, 10000);
            });
            setTimeout(()=>{
                if(!connection.connected){
                    log.logError("Restarting _bot after waiting 10 seconds with no response from server...", "slack/RTM::connect()");
                    process.exit();
                }
            }, 10*1000)
        });
    }
}

class Users{
    constructor(utils){
        this.utils = utils;
    }

    info(args,callback){
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("users.info", args, callback);
    }

    list(args,callback){
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("users.list", args, callback);
    }

    admininvite(args,callback){
        args = args || {};
        args.token = true;
        return this.utils.makeRequest("users.admin.invite", args, callback);
    }
}

class SlackAPI extends EventEmitter{
    constructor(token){
        super();
        //console.log(token);
        this.info = new Info();
        this.events = new Events(this);
        this.utils = new Utils(token);
        this.api = new API(this.utils);
        this.auth = new Auth(this.utils);
        this.bots = new Bots(this.utils);
        this.channels = new Channels(this.utils);
        this.chat = new Chat(this.utils);
        this.reactions = new Reactions(this.utils);
        this.rtm = new RTM(this.utils, this.events, this.info, this.utils);
        this.users = new Users(this.utils);
        //this.test = new Test();
    }

}

module.exports = {
    createBot: function(token){return new SlackAPI(token)}
}