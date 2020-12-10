const selector = e => document.querySelector(e)

const menuClick = selector("#menuClick")
const styleSelector = selector("#styleSelector")

menuClick.addEventListener("click", event => {
    event.preventDefault()
    styleSelector.classList.toggle('open')
})