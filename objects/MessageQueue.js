class MessageQueue{
    constructor(auto_start, interval){
        auto_start = auto_start || true;
        interval   = interval   || 1000;

        this._queue        = [];
        this._last         = 0;
        this._interval     = null;
        this._intervalTime = interval;
        this._interval_handler = ()=> {
            if (this.getQueueLength() > 0) {
                this.chat(this.getFirstQueueItem());
                this.setLastToNow();
            }
        }

        if(auto_start) this.startInterval();
    }

    startInterval(){
        this._interval = setInterval(this._interval_handler, this._intervalTime);
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
     * queue and return that
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
            this.chat(message);
            this.setLastToNow();
        } else this.addToQueue(message);
    }
}

module.exports = MessageQueue;