import {sendData , selector} from "./api.js"

const submit = selector("#submit")
const classHead = selector("#classHead")
const displayError = selector(".err-msg")

classHead.addEventListener("change" , event => { 
    event.preventDefault()
    let data = {
        classHead : event.target.value
    }
    sendData("/school/staff/confirm-head" , data)
    .then(res => {
        displayError.textContent = res.message
        submit.disabled = res.button
    }) 
    .catch(err => console.log(err.message))
})