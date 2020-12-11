let termDate = document.querySelector("#termDate")
let status = document.querySelector("#status")
let termlabel = document.querySelector('#termlabel')

status.addEventListener('change' , event => {
    console.log(status.value)
    if(status.value != "Active") {
        if(termDate.classList.contains('d-none')) {
            termDate.classList.remove('d-none')
            termDate.classList.add('d-block')
        }
        if(termlabel.classList.contains('d-none')) {
            termlabel.classList.remove('d-none')
            termlabel.classList.add('d-block')
        }
    }else {
        if(termDate.classList.contains('d-none')) {
            termDate.classList.remove('d-none')
            termDate.classList.add('d-none')
        }else {
            termDate.classList.remove('d-block')
            termDate.classList.add('d-none')
        }
        if(termlabel.classList.contains('d-none')) {
            termlabel.classList.remove('d-none')
            termlabel.classList.add('d-none')
        }else {
            termlabel.classList.remove('d-block')
            termlabel.classList.add('d-none')
        }

    }
})