import {sendData, getData} from './api.js'

const Analytics = {} 
Analytics.selector = e => document.querySelector(e) 
Analytics.selectAll = e => Array.from(document.querySelectorAll(e)) 
Analytics.createElement = e => document.createElement(e) 

let getAnalyticsRow = Analytics.selectAll(".analytics-row") || []  
let transferReport = Analytics.selector('#submitResult')
let displayMsg = Analytics.selector('#displayMsg')
let className = Analytics.selector("#className").textContent
let courseName = Analytics.selector("#courseName").textContent
let totalCells     = Analytics.selectAll(".total")
let firstTerm = Analytics.selectAll(".First")
let secondTerm = Analytics.selectAll(".Second")
let average = Analytics.selectAll(".average")
let grade = Analytics.selectAll(".grade")
let examCell = Analytics.selectAll("#Exam")
let studentID = Analytics.selectAll(".sName")
// let length = Analytics.selector("#length").textContent

const AnalyseRowData = (rowForAnalytics , cellsForResult, cellsForAverage, cellsForExam, cellsForFirstTerm, cellsForSecondTerm, cellsForGrade, cellsForName) => { 
    let dataObjects = [] 

    rowForAnalytics.map((nodes , i) => { 
        let data = {} // An object representing each row for our analysis

        // Filter tags that are not table data cells and without a class name data 
        let DataCells = Array.from(nodes.childNodes)
            .filter(cell => cell.tagName === "TD")
                .filter(cell => cell.classList.contains("data"))  

        // Map through the datacells to add properties to the data object 
        DataCells.map((cell , i) => {
            data[`${cell.classList[0]}`] = cell.textContent
            if(cell.textContent == '-'){
                cell.textContent = 0
            }
        }) 

        let examScore = cellsForExam[i].textContent

        let total = DataCells.reduce((a , b) => a + Number(b.textContent.trim()) , 0) 
        cellsForResult[i].textContent =  total

        let ca = total - examScore
        
        data.ca = ca
        // Attach the total property to data object 
        data.total = total 

        data.firstTerm = cellsForFirstTerm[i].textContent
        data.secondTerm = cellsForSecondTerm[i].textContent

        let firstCalc, firstValue
        if (cellsForFirstTerm[i].textContent != '-'){
            firstCalc = 1
            firstValue = Number(cellsForFirstTerm[i].textContent)
        }else{
            firstCalc = 0
            firstValue = 0
        }

        let secondCalc, secondValue
        if (cellsForSecondTerm[i].textContent != '-'){
            secondCalc = 1
            secondValue = Number(cellsForSecondTerm[i].textContent)
        }else{
            secondCalc = 0
            secondValue = 0
        }
        let averageCalc = 1 + firstCalc + secondCalc
        let average = Math.round((total + firstValue + secondValue) / averageCalc)
        cellsForAverage[i].textContent = average
        data.average = average

        data.studentID = cellsForName[i].id

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

let getAllDataObjects =  AnalyseRowData(getAnalyticsRow , totalCells, average, examCell, firstTerm, secondTerm, grade, studentID) 
console.log(getAllDataObjects)

transferReport.addEventListener('click', event => {
    event.target.disabled = true
    sendData(`/staff/upload-result/${courseName}/${className}/sheet/third-term` , {getAllDataObjects})
    .then(res => {
        displayMsg.textContent = res.message
        console.log(res.message)
        setTimeout(() => {
            window.location.replace(`/staff/upload-result/${courseName}/${className}/sheet/third-term`) 
        } , 2000)
    })
    .catch(err => console.error(err))
})