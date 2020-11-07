import {sendData} from './api.js'

const Analytics = {} 
Analytics.selector = e => document.querySelector(e) 
Analytics.selectAll = e => Array.from(document.querySelectorAll(e)) 
Analytics.createElement = e => document.createElement(e) 

let getAnalyticsRow = Analytics.selectAll(".analytics-row") || []  
let transferReport = Analytics.selector('#transferReport')
let displayMsg = Analytics.selector('#displayMsg')
const className = Analytics.selector("#className").textContent
let resultCells     = Analytics.selectAll(".total")
let average = Analytics.selectAll(".average")
let position = Analytics.selectAll(".position")
let studentID = Analytics.selectAll(".studentID")

const AnalyseRowData = (rowForAnalytics , cellsForResult, cellsForAverage, cellsForID) => { 
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
        })  

        let total = DataCells.reduce((a , b) => a + Number(b.textContent.trim()) , 0) 
        cellsForResult[i].textContent =  total
        
        // Attach the total property to data object 
        data.total = total 

        let average = (total / 200) * 100
        cellsForAverage[i].textContent = average

        data.average = average

        data.studentID = cellsForID[i].id
        // Add the data object to dataObjects array 
        dataObjects.push(data) 

        dataObjects.sort((a , b) => b.average - a.average)

        dataObjects.map((student , index , students) => { 

            let mainPosition = new Array(10)
            mainPosition[1] = "1st"
            mainPosition[2] = "2nd"
            mainPosition[3] = "3rd"
            mainPosition[4] = "4th"
            mainPosition[5] = "5th"
            mainPosition[6] = "6th"
            mainPosition[7] = "7th"
            mainPosition[8] = "8th"
            mainPosition[9] = "9th"
            mainPosition[10] = "10th" 

            student.position = mainPosition[index + 1]
            if (index === 0) {
                student.position = mainPosition[index + 1]
            }else if (index !== 0 && student.total === students[index - 1].total){
                student.position = students[index- 1].position
            }
        })
    }) 
    return dataObjects
} 

let getAllDataObjects =  AnalyseRowData(getAnalyticsRow , resultCells, average, studentID) 
console.log(getAllDataObjects)

transferReport.addEventListener('click', event => {
    event.preventDefault()
    sendData(`/staff/transfer-report/${className}` , {getAllDataObjects})
    .then(res => {
        displayMsg.textContent = res.message
        setTimeout(() => {
            window.location.replace(`/staff/broadsheet/${className}`) 
        } , 2000)
    })
    .catch(err => console.error(err))
})




