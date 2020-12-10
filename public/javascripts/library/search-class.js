import {selector} from './api.js'

const searchDates = selector('#searchDates')
const displayMsg = selector("#displayMsg")
const selectClass = selector("#selectClass")

searchDates.addEventListener('click', event => {
    event.preventDefault()
    displayMsg.textContent = "Loading..."
    if(selectClass.value !== ""){
        setTimeout(() => {
            window.location.replace(`/staff/finance/transactions/logs/class/${selectClass.value}`) 
        } , 2000)
    }else{
        displayMsg.textContent = "You need to select a class."
    }
})