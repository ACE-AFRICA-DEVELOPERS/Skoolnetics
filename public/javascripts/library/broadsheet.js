import {sendData, selector, selectAll} from './api.js'

const iDs = Array.from(selectAll("#id")).map(e => {
    return e.textContent
})

const total = Array.from(selectAll("#total")).map(e => {
    return e.textContent
})

const grade = Array.from(selectAll("#grade")).map(e => {
    return e.textContent
})

const exam = Array.from(selectAll("#Exam")).map(e => {
    return e.textContent
})

const courseName = selector("#courseName").textContent
const className = selector("#className").textContent
const displayMsg = selector("#displayMsg")

selector('#submitResult').addEventListener('click', event => {
    event.preventDefault()
    let target = []
    Array.from(selectAll(".sName")).map((e , i) => {
        e + iDs[i] + total[i] + exam[i]
        target.push({
            name: e.id,
            total: Number(total[i]),
            grade: grade[i],
            exam: Number(exam[i]),
            ca: Number(total[i]) - Number(exam[i])
        })
    })
    if(target.length > 0){
        console.log(target)
        sendData(`/staff/upload-result/${courseName}/${className}/sheet` , {target})
        .then(res => {
            displayMsg.textContent = res.message
            setTimeout(() => {
                window.location.replace(`/staff/upload-result/${courseName}/${className}/sheet`) 
            } , 2000)
        })
        .catch(err => console.error(err))
    }
})



