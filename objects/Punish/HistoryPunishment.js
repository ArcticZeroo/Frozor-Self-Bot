class HistoryPunishment{
    constructor(item_json){
        this.item_json = item_json;
        this.json      = this.parseFromItem(this.item_json);
    }

    getJson(){
        return this.json;
    }

    parseFromItem(item_json){
        var punishment_json = {
            "type": null,
            "severity": null,
            "active": null,
            "staff": "",
            "date": "",
            "reason": "",
            "removed": {
                "staff": "",
                "reason": ""
            }
        }
        switch(item_json.name){
            case("redstone_block"):
                punishment_json.type     = "GAMEPLAY";
                punishment_json.severity = 4;
                break;
            case("paper"):
                punishment_json.type     = "WARNING";
                punishment_json.severity = 1;
                break;
            case("writable_book"):
                punishment_json.type     = "CHAT";
                punishment_json.severity = this.getSeverityFromItemJSON();
                break;
            case("hopper"):
                punishment_json.type     = "GAMEPLAY";
                punishment_json.severity = this.getSeverityFromItemJSON();
                break;
            case("iron_sword"):
                punishment_json.type     = "HACKING";
                punishment_json.severity = this.getSeverityFromItemJSON();
                break;
            default:
                punishment_json.type     = "UKNOWN";
                break;
        }

        punishment_json.active   = this.getIsActiveFromItemJSON();
        punishment_json.date     = this.getDateFromItemJSON();
        punishment_json.reason   = this.getReasonFromItemJSON();
        punishment_json.staff    = this.getStaffFromItemJSON();
        //console.log(punishment_json.reason);

        return punishment_json;
    }

    getSeverityFromItemJSON(){
        for(var item of this.item_json.nbt.value.display.value.Lore.value.value){
            item = item.replace(/\u00A7[0-9A-FK-OR]/ig,'');
            var match_sev = item.match(new RegExp('Severity: ([1-4])'));
            if(match_sev != null) return match_sev[1];
        }
        return null;
    }

    getDateFromItemJSON(){
        for(var item of this.item_json.nbt.value.display.value.Lore.value.value){
            item = item.replace(/\u00A7[0-9A-FK-OR]/ig,'');
            //var detailed_date = new RegExp('Date: ([0-9][0-9])-([0-9][0-9])-([0-9][0-9][0-9][0-9]) ([0-9][0-9]):([0-9][0-9]):([0-9][0-9])');
            var match_date = item.match(new RegExp('Date: (.*)'));
            if(match_date != null) return match_date[1];
        }
        return null;
    }

    getStaffFromItemJSON(){
        for(var item of this.item_json.nbt.value.display.value.Lore.value.value){
            item = item.replace(/\u00A7[0-9A-FK-OR]/ig,'');
            var match_staff = item.match(new RegExp('Staff: (.*)'));
            if(match_staff != null) return match_staff[1];
        }
        return null;
    }

    getReasonFromItemJSON(){
        var add_flag = false;
        var reason   = "";
        for(var i = 0; i < this.item_json.nbt.value.display.value.Lore.value.value.length; i++){
            var item = this.item_json.nbt.value.display.value.Lore.value.value[i];
            item = item.replace(/\u00A7[0-9A-FK-OR]/ig,'');
            if(add_flag){
                if(item.startsWith("Staff: ")) return reason;
                if(item.trim() == "" || item.trim() == " "){
                    continue;
                }
                reason += " " + item.trim();
                continue;
            }
            var match_reason = item.match(new RegExp('Reason: (.*)'));
            if(match_reason != null){
                add_flag = true;
                reason = match_reason[1].trim();
            }
        }
        return null;
    }

    getIsActiveFromItemJSON(){
        if(this.item_json.nbt.value.ench) return true;
        return false;
    }

    isActive(){
        if(this.json.active) return true;
        return false;
    }

    getReason(){
        return this.json.reason;
    }

    getSeverity(){
        return this.json.severity;
    }

    getType(){
        return this.json.type;
    }

    getTypeRead(){
        var type = this.json.type.toLowerCase();
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    getDate(){
        return this.json.date;
    }

    getStaff(){
        return this.json.staff;
    }

    getSeverityColor(){
        var severity = this.getSeverity();
        if(severity){
            if(severity == 4) return "#F44336";
            if(severity == 3) return "#FF9800";
            if(severity == 2) return "#FFEB3B";
            if(severity == 1) return "#4CAF50";
        }
        return "#E0E0E0";
    }

    getSlot(){

    }

    getAttachment(){
        //console.log(`Returning attachment ${JSON.stringify(attachment)}`);
        return {
            "title":    `${this.getTypeRead()} Severity ${this.getSeverity()}`,
            "fallback": `${this.getTypeRead()} Severity ${this.getSeverity()}`,
            "text":     `${this.getReason()}`,
            "color":    `${this.getSeverityColor()}`
        };
    }

}

module.exports = HistoryPunishment;