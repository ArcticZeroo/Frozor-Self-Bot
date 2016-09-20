class User{
    constructor(slack_id){
        this.id = slack_id;
    }

    getID(){
        return this.id;
    }

    getMention(){
        return `<@${this.getID()}>`;
    }
}
module.exports = function(slack_id){return new User(slack_id)};