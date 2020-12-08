import {selector , getData} from "./api.js" 
let contentArea = selector("#content")
let id = contentArea.getAttribute("data-id") 
getData(`/staff/lesson-note/${id}/content`)
.then(res => {
    console.log(res.content.contentDetail) 
    contentArea.innerHTML = res.content.contentDetail
}).catch(err => console.error(err))

// let presentationArea = selector("#presentation")
// let id = presentationArea.getAttribute("data-id") 
// getData(`/staff/lesson-note/${id}/presentation`)
// .then(res => {
//     console.log(res.presentation) 
//     presentationArea.innerHTML = res.presentation
// }).catch(err => console.error(err))

// let contentArea = selector("#content")
// let id = contentArea.getAttribute("data-id") 
// getData(`/staff/lesson-note/${id}/content`)
// .then(res => {
//     console.log(res.content.contentDetail) 
//     contentArea.innerHTML = res.content.contentDetail
// }).catch(err => console.error(err))