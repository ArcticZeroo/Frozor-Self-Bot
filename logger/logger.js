var chalk          = require('chalk');
var fs             = require('fs');
var commands_queue = [];

class Logger{
    constructor(){
        this.chalk  = chalk;
    }

    getConsoleTimestamp(){
        var date = new Date();
        var minutes = date.getMinutes();
        var hours = date.getHours();
        var seconds = date.getSeconds();
        var month = parseInt(date.getMonth())+1;
        if(minutes < 10){
            minutes = "0" + minutes;
        }
        if(hours < 10){
            hours = "0" + hours;
        }
        if(seconds < 10){
            seconds = "0" + seconds;
        }

        var timestamp = "[" + month + "/" + date.getDate() + "/" + date.getFullYear() + " " + hours + ":" + minutes + ":" + seconds + "]";
        return timestamp + " ";
    }
    
    log(message, save, file){
        try{
            save = save || false;
            file = file || "output-log.txt";
            var toLog = chalk.bold(this.getConsoleTimestamp()) + message;
            try{
                process.stdout.write(`${toLog}\n`);
            }catch(e){
                //Don't do anything with e because if it can't console log then we are doomed anyways
            }
            if(save){
                toLog = "\r\n" + toLog;
                fs.appendFileSync(file, chalk.stripColor(toLog));
                return;
            }else{
                return;
            }
        }catch(e){
            //console.log(chalk.red("[log()] ERROR: ") + e);
        }
    }

    logError(message, prefix){
        try{
            prefix = prefix || false;
            if(!prefix){
            this.log(chalk.red("ERROR: ") + message, true, "error-log.txt");
            }else{
            this.log(chalk.red("["+ prefix + "] "+ "ERROR: ") + message, true, "error-log.txt");
            }
        }catch(e){
            this.log(chalk.red("[logError()] ERROR: ") + e, true, "error-log.txt");
        }
    }

    logDebug(message, prefix){
        try{
            prefix = prefix || false;
            if(!prefix){
            this.log(chalk.yellow("DEBUG: ") + message, true, "debug-log.txt");
            }else{
            this.log(chalk.yellow("["+ prefix + "] "+ "DEBUG: ") + message);
            }
        }catch(e){
            this.logError(e, "logDebug()");
        }
    }
    
    logInfo(message, prefix){
        try{
            prefix = prefix || false;
            if(!prefix){
            this.log(chalk.green("INFO: ") + message, true, "output-log.txt");
            }else{
            this.log(chalk.green("["+ prefix + "] "+ "INFO: ") + message);
            }
        }catch(e){
            this.logError(e, "logInfo()");
        }
    }

    logWarning(message, prefix){
        try{
            prefix = prefix || false;
            if(!prefix){
            this.log(chalk.magenta("WARNING: ") + message, true, "error-log.txt");
            }else{
            this.log(chalk.magenta("["+ prefix + "] "+ "WARNING: ") + message, true, "error-log.txt");
            }
        }catch(e){
            this.logError(e, "logWarning()");
        }
    }

    logGwen(message, prefix){
        try{
            prefix = prefix || false;
            if(!prefix){
            this.log(chalk.magenta(chalk.bold("GWEN: ")) + message, false);
            }else{
            this.log(chalk.magenta("["+ prefix + "] "+ chalk.bold("GWEN: ")) + message, true);
            }
        }catch(e){
            this.logError(e, "logWarning()");
        }
    }

    logCommand(name, command, type, success){
        try{
            type    = type || "/m"
            success = success || true;
            var successColorString;
            if(success){
                successColorString == chalk.green("Successfully");
            }else{
                successColorString == chalk.red("Unsuccessfully");
            }
            var logString = `User ${chalk.cyan(name)} executed the ${chalk.cyan(type)} command ${chalk.cyan(command)} ${successColorString}`;
            commands_queue.push(logString);
        }catch(e){
            this.logError(e, "logCommand()");
        }
    }
}

setTimeout(()=>{
    var toAppend = ""
    for(var i in commands_queue){
        toAppend += `\n${commands_queue[i]}` 
    }
    fs.appendFileSync("command-log.log", toAppend);
    commands_queue = [];
}, 10000)

module.exports = new Logger();