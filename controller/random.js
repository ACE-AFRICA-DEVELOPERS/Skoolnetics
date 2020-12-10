/**
 * random.js -  A small package for generating random characters using js 
*/
const generate = (factor) => { 
    let result = ''
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789" 
    let charLength = characters.length
    for ( let i = 0 ; i < factor ; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charLength))
    } 
    return result
}

module.exports = generate
