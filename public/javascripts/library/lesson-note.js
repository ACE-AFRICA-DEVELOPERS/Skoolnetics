import {selector , getData} from "./api.js" 
let contentArea = selector("#content")
let presentationArea = selector("#presentation")
let evaluationArea = selector("#evaluation")
let id = contentArea.getAttribute("data-id") 
getData(`/staff/lesson-note/${id}/content`)
.then(res => {
    console.log(res.content.contentDetail) 
    contentArea.innerHTML = res.content.contentDetail
    presentationArea.innerHTML = res.presentation
    evaluationArea.innerHTML = res.evaluation
}).catch(err => console.error(err))