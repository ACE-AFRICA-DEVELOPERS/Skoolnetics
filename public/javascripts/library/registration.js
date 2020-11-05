import {selector} from "./api.js"
import {validateEmail , validatePassword , verifyPassword} from "./validate.js" 

const schoolName = selector('#schoolName')
const schoolAdminName = selector('#schoolAdminName')
const schoolEmail = selector('#schoolEmail')
const schoolNumber = selector('#schoolNumber')
const password = selector('#password')
const cPassword = selector('#cPassword')
const address = selector('#address')
const state = selector('#state')
const country = selector('#country')
const submit = selector('#submit')

schoolEmail.addEventListener('blur', event => {
    if(validateEmail(event.target.value.trim()).value){
        selector('#d-e').textContent = ""
    }else{
        selector('#d-e').textContent = "Email is invalid"
    }
})

password.addEventListener('blur', event => {
    if(validatePassword(event.target.value.trim()).value){
        selector('#d-p').textContent = ""
    }else{
        selector('#d-p').textContent = "Password is too weak"
    }
})

cPassword.addEventListener('blur', event => {
    if(verifyPassword(password , event.target).value){
        selector('#d-cp').textContent = ""
    }else{
        selector('#d-cp').textContent = "Password do not match"
    }
})



submit.addEventListener('click', event=> {
    if(schoolName.value != '' && schoolAdminName.value != '' && schoolNumber.value != ''
        && state.value != '' && country.value != '' && address.value != ''
        && (validateEmail(schoolEmail.value).value) != '' && (validatePassword(password.value).value) != ''
        && (verifyPassword(cPassword.value).value) != ''){

        if(selector('.check').checked){
            console.log('Redirecting...')
        }else{
            event.preventDefault()
            selector('#on-submit').textContent = "Accept our terms and conditions."
        }
    }else{
        event.preventDefault()
        selector('#on-submit').textContent = "Please fill all fields."
    }
})