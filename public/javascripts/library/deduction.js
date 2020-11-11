import { selector, selectAll } from "./api.js"

const total = selector("#total-paid")
const hide = selector("#hide")

total.addEventListener("click", event => {
    event.preventDefault()
    let target = []
    Array.from(selectAll(".check")).map((e , i) => {
        if(e.checked){
            target.push(Number(e.id))
        }  
    })
    let sum = target.reduce((a, b) => a + b)
    if(hide.classList.contains('d-none')){
        hide.classList.remove('d-none')
    }
    selector("#totalPayment").textContent = `Pay #${sum.toLocaleString()}`
})

function showPayment() {
    let x = document.getElementById("payment");

    if(x.style.display == "none") {
        x.style.display == "block"
    }else {
        x.style.display = "none"
    }
}

