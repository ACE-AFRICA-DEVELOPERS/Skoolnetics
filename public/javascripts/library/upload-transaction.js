import {sendData , createElement, selector, selectAll} from "./api.js"

const displayMsg = selector("#displayMsg")

selector("#proof").addEventListener("change", event => {
    sendData('/get-proof-details', {proof : event.target.value})
    .then(res => {
        let col = selector("#displayProof")
        let image = createElement("img")
        image.width = "200"
        image.height = "200"
        image.src =  res.paymentProof.proof
        let para = createElement("p")
        para.textContent = "For " + res.student.lastName + " " + res.student.firstName
        let para2 = createElement("p")
        para2.textContent = res.paymentProof.description
        col.append(para, para2, image)
    })
    .catch(err => displayError.textContent = err)
})

let i = 1
selector("#add-more").addEventListener("click", event => {
    event.preventDefault()
    i++
    let div = createElement('div')
    div.id = i
    let deleteLink = `<a href="#" id="${i}" class="red-color trash-it"><i class="feather icon-trash"></i></a>`
    div.innerHTML = deleteLink + selector("#replicate").innerHTML
    selector(".paste-here").appendChild(div)
})

// function delIt(id){
//     let ele = selector(`#${id}`)
//     let parent = selector(".paste-here")
//     parent.removeChild(ele)
// }
selector("#submit").addEventListener("click", event => {
    event.preventDefault()
    displayMsg.textContent = "Please wait..."
    let proof = selector("#proof").value
    const studentID = selector("#studentID").value
    const paymentFor = Array.from(selectAll("#paymentFor")).map(e => {
        return e.value
    })
    let target = []
    Array.from(selectAll("#amountPaid")).map((e , i) => {
        e + paymentFor[i] 
        if(e.value != '' && paymentFor[i] != ''){
            target.push({
                paymentFor: paymentFor[i],
                amountPaid: e.value
            })
        }
    })
    if(target.length > 0 && studentID != ""){
        event.target.disabled = true
        sendData(`/staff/finance/transactions/upload` , {target, studentID, proof})
        .then(res => {
            displayMsg.textContent = res.message
            setTimeout(() => {
                window.location.replace(`/staff/finance/transactions/upload`) 
            } , 2000)
        })
        .catch(err => console.error(err))
    }else{
        displayMsg.textContent = "Fill in compulsory fields."
    }
})