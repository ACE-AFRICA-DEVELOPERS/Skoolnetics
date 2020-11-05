import {sendData} from './api.js'

const Analytics = {} 
Analytics.selector = e => document.querySelector(e) 
Analytics.selectAll = e => Array.from(document.querySelectorAll(e)) 
Analytics.createElement = e => document.createElement(e) 

let getAnalyticsRow = Analytics.selectAll(".analytics-row") || []  
let resultCells     = Analytics.selectAll(".total")

const AnalyseRowData = (rowForAnalytics , cellsForResult) => { 
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

        // Add the data object to dataObjects array 
        dataObjects.push(data) 
    }) 
    return dataObjects
} 
if (getAnalyticsRow) {
    let getAllDataObjects =  AnalyseRowData(getAnalyticsRow , resultCells) 
    console.log(getAllDataObjects)
}



