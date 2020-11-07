import {selector} from './api.js'

const openRemark = selector('#toggle')
const form = selector('#hide-form')

openRemark.addEventListener('click', event => {
    event.preventDefault()
    form.classList.toggle('hide-form')
})