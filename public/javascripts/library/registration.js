import {selector} from "./api.js"
import {validateEmail , validatePassword , verifyPassword} from "./validate.js" 

const userName = selector('#userName')
const name = selector('#name')
const email = selector('#email')
const address = selector('#address')
const submit = selector('#submit')
const final = selector('.submit')



submit.addEventListener('click', event=> {
    try {
        if(userName.value != '' && name.value != '' && email.value != '' && address.value != ''){
            const checkbox = selector(".check")
            if(checkbox.checked){
                console.log("Redirecting")
            }else{
                event.preventDefault()
                if(event.target.previousSibling) {
                    event.target.previousSibling.remove()
                }
                final.textContent = "Please, accept our terms and conditions"
                final.classList.add('text-danger')
                event.target.parentNode.insertBefore(final, event.target)
            }
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