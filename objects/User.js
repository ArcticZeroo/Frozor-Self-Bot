class User{
    constructor(slack_id){
        this.id = slack_id;
    }

    /**
     * @returns {string}
     */
    getID(){
        return this.id;
    }

    /**
     * @returns {string}
     */
    getMention(){
        return `<@${this.getID()}>`;
    }
}
module.exports = function(slack_id){return new User(slack_id)};