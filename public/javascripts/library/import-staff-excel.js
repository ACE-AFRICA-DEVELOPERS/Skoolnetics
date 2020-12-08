
import {createElement, selector, sendData} from "./api.js"

//Handling only one excel file
var input = selector('#excelImport') 
let values =  []
input.addEventListener('change', function() {  
    readXlsxFile(input.files[0], { dateFormat: 'MM/DD/YY' }).then(function(data) { 
        values = data
        let keys = values.shift()
        values = values.map(row => {
            return keys.reduce((obj, key, i) => {
                obj[key] = row[i]
                return obj
            }, {})
        })
  
        let app = selector("#app") 
        let table = createElement("table") 
        table.setAttribute("class" , "table table-striped") 
        let button = createElement('button')
        button.setAttribute('class', 'btn btn-info')
        button.textContent = 'Submit'
        let para = createElement('p')
        let thead = createElement("thead")
        thead.classList.add('thead-light')
        let theadRow = createElement('tr')
        let tbody = createElement('tbody')
        let objKeys = Object.keys(values[0])
        objKeys.map(o => {
            let th = createElement('th')
            th.textContent = o
            theadRow.append(th)
            thead.append(theadRow)
        })
        values.map(v => {
            let tr = createElement('tr')
            for (let key of Object.values(v)){
                let td = createElement("td") 
                td.textContent = key 
                tr.append(td)
            }
            tbody.append(tr)
        }) 
        table.append(thead, tbody)
        app.append(table, button, para)
        button.addEventListener('click', event => {
            button.disabled = true
            sendData(`/school/staff/import`, {name: values})
            .then(res => {
                para.textContent = res.message
                setTimeout(() => {
                    location.replace("/school/staff")
                } , 1000)
            })
            .catch(err => para.textContent = err.message)
        })
    })
})



