import {sendData , createElement, selector} from "./api.js"

const class_select = selector("#selectClass")
const displayMessage = selector("#displayClasses")
const title = selector('#title').textContent

console.log(title)

class_select.addEventListener("change" , event => { 
    displayMessage.textContent = ''
    sendData('/school/get-students', {className : event.target.value, title: title})
    .then(res => {
        if(res.status != 404){
            let row = createElement('div')
            row.classList.add('row')
            res.message.map(item => {
                let column = createElement('div')
                column.classList.add('col-md-3', 'mb-3')
                let anchor = createElement('a')
                anchor.href = `/school/new-student/${item._id}`
                anchor.classList.add('text-dark')
                let fieldBox = createElement('div')
                fieldBox.classList.add('field-box')
                let para = createElement('p')
                para.textContent = item.lastName + ' ' + item.firstName + ' ' + item.otherName
                fieldBox.append(para)
                anchor.append(fieldBox) 
                column.append(anchor)
                row.append(column)
            })
            displayMessage.append(row)
        }else{
            displayMessage.textContent = res.message
        }
        
    })
    .catch(err => displayMessage.textContent = err)
})