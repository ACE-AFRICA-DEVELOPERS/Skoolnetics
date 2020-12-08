const accountNumber = (coll , currentValue , property , increment , padLength  ) => {
    try {
        console.log(coll)
        let newAccountNumber
        if (Array.isArray(coll) ){
            if (coll.length !== 0){
                let lastRecord =  coll[coll.length - 1][property] 
                lastRecord = Number(lastRecord.substr(lastRecord.length - padLength))
                
                newAccountNumber = (String(lastRecord + increment)).padStart(padLength, "0")
                return newAccountNumber
            }else {
                newAccountNumber = currentValue 
                return newAccountNumber
            }
        }else {
            throw new Error("Provide an array of records")
        }
    }catch(error){
        return error
    }
} 
module.exports = accountNumber