class dateFormatter {
    /**
     * 
     * @param {String} inputStr 
     * @returns 
     */
    static Formatter(inputStr) {
        console.log(inputStr)
        try {
            // 拆分日期和时间部分
            const [datePart, timePart] = inputStr.split('T');

            // 处理日期部分
            const [year, month, day] = datePart.split('-');
            const formattedDate = `${year}年${parseInt(month)}月${parseInt(day)}日`;

            // 处理时间部分并替换分隔符
            const formattedTime = timePart.replace(/-/g, ':');

            return {
                date: formattedDate,
                time: formattedTime
            };
        } catch (error) {
            console.error('日期格式错误:', error);
            return { date: 'Invalid Date', time: 'Invalid Time' };
        }
    }

    /**
     * 
     * @param {Array} formattedTime 
     * @returns 
     */
    static getDate(formattedTime) {
        const date = []
        for (let i = 0; i < formattedTime.length; i++) {
            date.push(formattedTime[i].date)
        }
        return date
    }

    /**
     * 
     * @param {Array} formattedTime 
     * @returns 
     */
    static getTime(formattedTime) {
        const time = []
        for (let i = 0; i < formattedTime.length; i++) {
            time.push(formattedTime[i].time)
        }
        return time
    }
}

export default dateFormatter