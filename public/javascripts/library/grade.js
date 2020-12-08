import {selector, sendData} from './api.js'

console.log(selector('#submitGrade'))
selector('#submitGrade').addEventListener('click', event => {
    console.log('test')
    // let formBody = {
    //     grade: selector('#grade').value,
    //     lowestGrade: selector('#lowestGrade').value,
    //     highestGrade: selector('#highestGrade').value
    // }

    // console.log(formBody)
    // selector('#displayMsg').textContent = 'Successful'
})