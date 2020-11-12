import {sendData , createElement, selector} from "./api.js"

const class_select = selector("#selectClass")
const displayMessage = selector("#displayClasses") 
const title = 'All Students'


class_select.addEventListener("change" , event => { 
    displayMessage.textContent = ''
    sendData('/school/get-students', {className : event.target.value, title: title})
    .then(res => {
        if(res.status != 404){
            displayMessage.textContent = `${res.message.length} students found.`
            setTimeout(() => {
                window.location.replace(`/school/students/graduate/${event.target.value}`) 
            } , 2000)
        }else{
            displayMessage.textContent = res.message
        }
    })
    .catch(err => displayMessage.textContent = err)
})

