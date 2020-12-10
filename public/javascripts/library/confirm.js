import {sendData , selector} from "./api.js"

const submit = selector("#submit")
const classHead = selector("#classHead")
const role = selector("#role")
const displayError = selector(".err-msg")

role.addEventListener("change", event => {
    if(event.target.value != 'Teacher'){
        classHead.style.display = "none"
    }else{
        classHead.style.display = "block"
    }
})

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