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
let length = Analytics.selector("#length").textContent

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

        let average = ((total / (Number(length) * 100)) * 100).toFixed(2)
        cellsForAverage[i].textContent = average

        data.average = average

        data.studentID = cellsForID[i].id
        // Add the data object to dataObjects array 
        dataObjects.push(data) 

        dataObjects.sort((a , b) => b.average - a.average)

        dataObjects.map((student , index , students) => { 

            let mainPosition = new Array(100)
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
            mainPosition[11] = "11th" 
            mainPosition[12] = "12th" 
            mainPosition[13] = "13th" 
            mainPosition[14] = "14th" 
            mainPosition[15] = "15th" 
            mainPosition[16] = "16th" 
            mainPosition[17] = "17th" 
            mainPosition[18] = "18th" 
            mainPosition[19] = "19th" 
            mainPosition[20] = "20th" 
            mainPosition[21] = "21th" 
            mainPosition[22] = "22nd" 
            mainPosition[23] = "23rd" 
            mainPosition[24] = "24th" 
            mainPosition[25] = "25th" 
            mainPosition[26] = "26th" 
            mainPosition[27] = "27th" 
            mainPosition[28] = "28th" 
            mainPosition[29] = "29th" 
            mainPosition[30] = "30th" 
            mainPosition[31] = "31st" 
            mainPosition[32] = "32nd" 
            mainPosition[33] = "33rd" 
            mainPosition[34] = "34th" 
            mainPosition[35] = "35th" 
            mainPosition[36] = "36th" 
            mainPosition[37] = "37th" 
            mainPosition[38] = "38th" 
            mainPosition[39] = "39th" 
            mainPosition[40] = "40th" 
            mainPosition[41] = "41st" 
            mainPosition[42] = "42nd" 
            mainPosition[43] = "43rd" 
            mainPosition[44] = "44th" 
            mainPosition[45] = "45th" 
            mainPosition[46] = "46th" 
            mainPosition[47] = "47th" 
            mainPosition[48] = "48th"
            mainPosition[49] = "49th"
            mainPosition[50] = "50th"
            mainPosition[51] = "51th"
            mainPosition[52] = "52nd"
            mainPosition[53] = "53rd"
            mainPosition[54] = "54th"
            mainPosition[55] = "55th"
            mainPosition[56] = "56th"
            mainPosition[57] = "57th"
            mainPosition[58] = "58th"
            mainPosition[59] = "59th"
            mainPosition[60] = "60th"
            mainPosition[61] = "61st"
            mainPosition[62] = "62nd"
            mainPosition[63] = "63rd"
            mainPosition[64] = "64th"
            mainPosition[65] = "65th"
            mainPosition[66] = "66th"
            mainPosition[67] = "67th"
            mainPosition[68] = "68th"
            mainPosition[69] = "69th"
            mainPosition[70] = "70th"
            mainPosition[71] = "71st"
            mainPosition[72] = "72nd"
            mainPosition[73] = "73rd"
            mainPosition[74] = "74th"
            mainPosition[75] = "75th"
            mainPosition[76] = "76th"
            mainPosition[77] = "77th"
            mainPosition[78] = "78th"
            mainPosition[79] = "79th"
            mainPosition[80] = "80th"
            mainPosition[81] = "81st"
            mainPosition[82] = "82nd"
            mainPosition[83] = "83rd"
            mainPosition[84] = "84th"
            mainPosition[85] = "85th"
            mainPosition[86] = "86th"
            mainPosition[87] = "87th"
            mainPosition[88] = "88th"
            mainPosition[89] = "89th"
            mainPosition[90] = "90th"
            mainPosition[91] = "91st"
            mainPosition[92] = "92nd"
            mainPosition[93] = "93rd"
            mainPosition[94] = "94th"
            mainPosition[95] = "95th"
            mainPosition[96] = "96th"
            mainPosition[97] = "97th"
            mainPosition[98] = "98th"
            mainPosition[99] = "99th"
            mainPosition[100] = "100th"
            
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




