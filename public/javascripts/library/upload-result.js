import {sendData , selector} from "./api.js"

const exam_select = selector("#examSelect")
const total = selector("#total")
const displayError = selector("#displayError")

exam_select.addEventListener("change" , event => { 

    sendData('/fetch-total-score', {examType : event.target.value})
    .then(res => {
        total.value = res.message
        selector("#max").max = res.message
    })
    .catch(err => displayError.textContent = err)
})