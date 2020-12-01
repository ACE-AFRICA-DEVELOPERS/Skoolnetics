import {selector} from './api.js'

const searchDates = selector('#searchDates')
const displayMsg = selector("#displayMsg")
const startDate = selector("#startDate")
const endDate = selector("#endDate")

searchDates.addEventListener('click', event => {
    event.preventDefault()
    displayMsg.textContent = "Loading..."
    if(startDate.value !== "" && endDate.value !== ""){
        setTimeout(() => {
            window.location.replace(`/staff/finance/transactions/logs/today/${startDate.value}/${endDate.value}`) 
        } , 1000)
    }else{
        displayMsg.textContent = "You need to select a start and end date"
    }
})