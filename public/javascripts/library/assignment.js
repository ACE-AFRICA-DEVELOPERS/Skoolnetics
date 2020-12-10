import {selector , getData} from "./api.js" 
let contentArea = selector("#content")
let id = contentArea.getAttribute("data-id") 
getData(`/staff/assignment/${id}/content`)
.then(res => {
    console.log(res.content.contentDetail) 
    contentArea.innerHTML = res.content.contentDetail
}).catch(err => console.error(err))