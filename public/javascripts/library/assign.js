import {sendData, selector, createElement, selectAll} from "./api.js"

const className = selector("#className")
const subject = selector("#subject")

className.addEventListener("change", event => {
    subject.textContent = null
    let firstSubject = createElement("option")
    firstSubject.textContent = "Please select a subject"
    subject.append(firstSubject)
    const dataToSend = {
        className : event.target.value
    }

    sendData("/fetch-class-subjects", dataToSend)
    .then(res => {
        console.log(res)
        res.map(item => {
            let subjects = document.createElement("option")
            subjects.value = item
            subjects.textContent = item
            subject.append(subjects)
        })
    })
    .catch(err => console.log(err))
})