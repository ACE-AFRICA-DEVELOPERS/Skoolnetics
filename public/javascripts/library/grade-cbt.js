import {sendData} from './api.js'

const Analytics = {} 
Analytics.selector = e => document.querySelector(e) 
Analytics.selectAll = e => Array.from(document.querySelectorAll(e)) 
Analytics.createElement = e => document.createElement(e) 

let getAnalyticsRow = Analytics.selectAll(".analytics-row") || []  

let average = Analytics.selectAll(".average")
let grade = Analytics.selectAll(".grade")

const AnalyseRowData = (rowForAnalytics , cellsForAverage, cellsForGrade) => { 
    let dataObjects = [] 

    rowForAnalytics.map((nodes , i) => { 
        let data = {} // An object representing each row for our analysis

        let average = cellsForAverage[i].textContent

        data.average = average

        sendData(`/fetch-grade` , {average})
        .then(res => {
            cellsForGrade[i].textContent = res.message
            data.grade = res.message
        })
        .catch(err => console.error(err))

        dataObjects.push(data) 
        
    }) 
    return dataObjects
} 

let getAllDataObjects =  AnalyseRowData(getAnalyticsRow , average, grade) 
console.log(getAllDataObjects)
