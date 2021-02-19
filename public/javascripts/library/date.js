import {selector} from "./api.js"
import {validateEmail , validatePassword , verifyPassword} from "./validate.js" 

const term = selector('#term')
const start = selector('#start')
const end = selector('#end')
const submit = selector('#submit')
const final = selector('.submit')



submit.addEventListener('click', event=> {
    try {
        if(term.value != '' && start.value != '' && end.value != ''){
            console.log("Redirecting")
        }else {
            final.textContent = "Please fill all the fields correctly!"
            final.classList.add('text-danger')
            event.preventDefault()
        }
    }catch(error) {
        const errorArea = selector(".submit")
        errorArea.textContent = error.message 
        event.preventDefault()
    }
})