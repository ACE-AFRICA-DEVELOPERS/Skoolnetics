import { selector, selectAll, sendData } from "./api.js"

const total = selector("#total-paid")

total.addEventListener("click", event => {
    event.preventDefault()
    let target = []
    Array.from(selectAll("#check")).map((e , i) => {
        if(e.checked){
            target.push(Number(e.getAttribute("data-amount")))
        }  
    })
    selector("#hide").classList.remove('d-none')
    let sum = target.reduce((a, b) => a + b)
    selector("#totalPayment").textContent = `Pay #${sum.toLocaleString()}`
})

selector("#payment").addEventListener("click", event => {
    event.target.disabled = true
    let target = []
    let targetSum = []
    Array.from(selectAll("#check")).map((e , i) => {
        if(e.checked){
            targetSum.push(Number(e.getAttribute("data-amount")))
            target.push(e.getAttribute("data-pay"))
        }  
    })
    let sum = targetSum.reduce((a, b) => a + b)
    let output = []
    for(let i = 0; i < target.length; i ++){
        output.push({
            paymentFor: target[i],
            amountPaid: targetSum[i]
        })
    }
    let formBody = {
        amount: sum,
        student: selector("#student").textContent,
        target: output
    }
    sendData('/parent/store-payment', formBody)
    .then(res => {
        let payID = res.payID
        let amount = res.amount
        location.replace(`/charge-payee/${amount}/${payID}`)
    })
    .catch(err => console.log(err.message))
})


