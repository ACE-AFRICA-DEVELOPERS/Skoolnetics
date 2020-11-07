import {sendData , selector} from "./api.js"

let form1 = selector("#r-1")
if(form1){
    form1.addEventListener("click" , event => { 
        event.preventDefault()
        let form = selector("#r-1-form")
        let display = selector("#r-1-display")
        if(form.value == ""){
            display.textContent = "Please provide a name for the role."
        }else{
            sendData(`/school/assign-roles`, {name : form.value, role: 'r-1'})
            .then(res => {
                display.textContent = res.message
                event.target.disabled = true
                setTimeout(() => {
                    window.location.replace('/school/roles') 
                } , 2000)
            })
            .catch(err => display.textContent = err)
            event.target.disabled = true
        } 
    })
}

let form2 = selector("#r-2")
if(form2){
    form2.addEventListener("click" , event => { 
        event.preventDefault()
        let form = selector("#r-2-form")
        let display = selector("#r-2-display")
        if(form.value == ""){
            display.textContent = "Please provide a name for the role."
        }else{
            sendData(`/school/assign-roles`, {name : form.value, role: 'r-2'})
            .then(res => {
                display.textContent = res.message
                event.target.disabled = true
                setTimeout(() => {
                    window.location.replace('/school/roles') 
                } , 2000)
            })
            .catch(err => display.textContent = err)
            event.target.disabled = true
        } 
    })
}