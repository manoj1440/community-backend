const getFinancialYear = (date = new Date()) => {
    const validDate = date instanceof Date ? date : new Date(date);
    const year = validDate.getFullYear();
    const month = validDate.getMonth() + 1;

    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

module.exports = getFinancialYear;
