import {sendData , selector} from "./api.js"

const oldPassword = selector("#oldPassword")
const newPassword = selector("#newPassword")
const cNewPassword = selector("#cNewPassword")
const submitPassword = selector("#submitPassword")
const displayMsg = selector("#displayMsg")

submitPassword.addEventListener("click" , event => { 
    event.preventDefault()
    if(oldPassword.value != '' && newPassword.value != '' && cNewPassword.value != ''){
        if(newPassword.value == cNewPassword.value){
            sendData('/change-student-password', {oldPassword: oldPassword.value, newPassword: newPassword.value, cNewPassword: cNewPassword.value})
            .then(res => {
                if(res.status > 400){
                    displayMsg.classList.remove('text-c-green')
                    displayMsg.classList.add('text-c-red')
                    displayMsg.textContent = res.message
                }else{
                    displayMsg.classList.remove('text-c-red')
                    displayMsg.classList.add('text-c-green')
                    displayMsg.textContent = res.message

                    setTimeout(() => {
                        window.location.replace('/student/settings') 
                    } , 1000)
                }
            })
            .catch(err =>{
                displayMsg.classList.remove('text-c-green')
                displayMsg.classList.add('text-c-red')
                displayMsg.textContent = err.message
            })            
        }else{
            displayMsg.classList.remove('text-c-green')
            displayMsg.classList.add('text-c-red')
            displayMsg.textContent = "Passwords does not match."
        }
    }else{
        displayMsg.classList.remove('text-c-green')
        displayMsg.classList.add('text-c-red')
        displayMsg.textContent = "Please complete all fields"
    }
   
})
