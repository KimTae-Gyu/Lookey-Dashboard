// UTC 시간대 변경
const toUTC = (timestamp) => {
    const utcDate = new Date(timestamp);
    const koreaUtcDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));
    console.log(koreaUtcDate);

    return koreaUtcDate;
}

function wafParse(data) {
    let wafLogs = data;

    wafLogs.forEach(wafLog => {
        const utcTimestamp = toUTC(wafLog.timestamp);
        wafLog.timestamp = utcTimestamp;
    });    

    return wafLogs;
}

function nfwParse(data) {

}

module.exports = {
    wafParse, nfwParse
};