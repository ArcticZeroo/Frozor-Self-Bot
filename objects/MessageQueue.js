var EventEmitter = require('events');

/**
 * @class - This Class queues messages so that the Minecraft Bot isn't hit by Mineplex's
 * command center, which limits at just below 1 message/second. To do this, this_last stores
 * the last sent message, and when another message is requested to be sent the two compare
 * to see if one has been sent in the last second. If so, it is added to this._queue
 * which is processed at a regular interval. Additionally, if there are messages pending
 * in the messageQueue, even if it has been more than a second since the last message, the message
 * will be added to the message messageQueue.
 */

class MessageQueue extends EventEmitter{
    constructor(auto_start, interval){
        auto_start = auto_start || true;
        interval   = interval   || 1000;

        this._queue        = [];
        this._last         = 0;
        this._interval     = null;
        this._intervalTime = interval;
        this._interval_handler = ()=> {
            if (this.getQueueLength() > 0) {
                this.emitMessage(this.getFirstQueueItem());
                this.setLastToNow();
            }
        }

        if(auto_start) this.startInterval();
    }

    startInterval(){
        this._interval = setInterval(this._interval_handler, this._intervalTime);
    }

    stopInterval(){
        clearInterval(this._interval);
    }

    getLast(){
        return this._last;
    }

    getTimeSinceLast(){
        return ( Date.now() - this.getLast() ) / 1000;
    }

    /**
     * This method will REMOVE
     * the first item in the
     * messageQueue and return that
     * item.
     */
    getFirstQueueItem(){
        return this.getQueue().splice(0, 1).toString();
    }

    setLastToNow(){
        this._last = Date.now();
    }

    getQueue(){
        return this._queue;
    }

    addToQueue(item){
        this.getQueue().push(item);
    }

    getQueueLength(){
        return this.getQueue().length;
    }

    queue(message) {
        if (this.getQueueLength().length > 0) return this.addToQueue(message);

        if (this.getTimeSinceLast() >= 1) {
            this.emitMessage(message);
            this.setLastToNow();
        } else this.addToQueue(message);
    }

    emitMessage(message){
        this.emit('message', message);
    }
}

module.exports = MessageQueue;