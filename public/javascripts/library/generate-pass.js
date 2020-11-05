import {sendData, selector, selectAll} from './api.js'

const submit = selector("#submit")
const markCheck = selector("#selectAll")
const spanClass = selector("#span-class")
const displayMsg = selector("#displayMsg")

markCheck.addEventListener("change" , event => {
    if(event.target.checked){
        Array.from(selectAll(".check")).map((e , i) => {
            e.checked = true
        })
    }else{
        Array.from(selectAll(".check")).map((e , i) => {
            e.checked = false
        })
    }
})

submit.addEventListener("click", event => {
    event.preventDefault()
    let targetStudents = []
    Array.from(selectAll(".check")).map((e , i) => {
        if(e.checked){
            targetStudents.push({
                id : e.id 
            })
        }
    })
    if (targetStudents.length > 0){
        //Send the id of students selected to the server
        displayMsg.textContent = "Please wait..."
        sendData(`/staff/cbt/quick-one/${spanClass.textContent}/passwords` , {targetStudents})
        .then(res => {
            displayMsg.textContent = res.message
            setTimeout(() => {
                window.location.replace(`/staff/cbt/quick-one/${spanClass.textContent}/passwords`) 
            } , 2000)
        })
        .catch(err => displayMsg.textContent = err.message) 
         
    }else{
        displayMsg.textContent = "Select at least one student.."
    }
})

