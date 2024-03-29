import {sendData, selector, selectAll} from './api.js'

const markCheck = selector("#updateAll")
const span = selector(".name-class")

selector('#holiday').addEventListener('change', event => {
    if(event.target.value == 'Yes'){
        selector('#hideIt').classList.toggle('d-none')
    }
})

//let studentsRegister = Array.from(selectAll(".check")) 
markCheck.addEventListener("click" , event => {
    let targetStudents = [] 
    let date = selector("#dateData").value.trim()
    let week = selector("#weekData").value.trim()
    let displayErr = selector(".err-msg")
    let holiday = selector("#holiday").value.trim()
    let holidayReason = selector('#holidayReason')
    Array.from(selectAll(".check")).map((e , i) => {
        if (date !== null && date !== "" && week !== null && week !== ""){ 
            if(holiday != 'Yes'){
                displayErr.textContent = " "
                if(e.checked){
                    targetStudents.push({
                        id : e.id , 
                        date : date,
                        week : Number(week),
                        mark : "Present"
                    })
                }else{
                    targetStudents.push({
                        id : e.id , 
                        date : date,
                        week : Number(week),
                        mark : "Absent"
                    })
                }
            }else{
                targetStudents.push({
                    id : e.id , 
                    date : date,
                    week : Number(week),
                    holiday: true,
                    holidayReason: holidayReason.value
                })
            }
        }else{
            displayErr.textContent = "You need to select a date and week first."
            return
        }
    })
    if (targetStudents.length > 0){
        event.target.disabled = true
        //Send the id of students whose records need to be updated to the server
        sendData(`/staff/mark-attendance/${span.textContent}` , {targetStudents})
        .then(res => {
            displayErr.textContent = res.message
            setTimeout(() => {
                window.location.replace(`/staff/attendance/${span.textContent}`) 
            } , 2000)
        })
        .catch(err => console.error(err)) 
    }
})





