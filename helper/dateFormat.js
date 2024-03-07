var date = require('date-and-time');
const now = new Date();

module.exports = {
    formatDate(){
       return date.format(now, 'YYYY/MM/DD')
    },
    formatTime(){
        return date.format(now, 'HH:mm:ss');
    },
    formatGivendate(givenDate){
       const today = date.isSameDay(new Date(givenDate), new Date(now));
       const tommorrow = date.isSameDay(new Date(givenDate),date.addDays(new Date(now), +1));
       if(today){
         return 'Today, '+date.format(new Date(givenDate), 'hh:mm A');
       }
       else if(tommorrow){
        return 'Tommorrow, '+date.format(new Date(givenDate), 'hh:mm A');
       }
       else{
        return date.format(new Date(givenDate), 'MMM DD, hh:mm A');
       }
    }
    
}