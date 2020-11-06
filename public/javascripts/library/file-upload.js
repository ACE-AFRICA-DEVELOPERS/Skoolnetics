
let selector = e => document.querySelector(e) 

selector('#toggle').addEventListener('click', event => {
	event.preventDefault()
	selector('#hide-form').classList.toggle('hide-form')
})

const logo = selector("#logo")
const stamp = selector("#stamp")

logo.addEventListener('change' , showLogo) 
stamp.addEventListener('change' , showStamp)

function showLogo() {
	let files = this.files[0]  
    let acceptedFile = ["image/jpeg" , "image/jpg" , "image/png" , "image/gif"] 
    let divisor = 1024*1024
    let size = Number(files.size)/divisor
	let type = files.type 
	console.log(type)
	if (acceptedFile.includes(type)  && size  < 10) {
		let reader = new FileReader() 
		reader.onload = function(event) {
			selector(".hideLogo").style.display = "none"
			selector(".removeLogo").style.display = "block"
			let img = new Image() 
			img.onload = function() {
				selector("#displayLogo").append(img)
			}
			img.src = event.target.result 
			img.style.width = '150px'
			img.style.height = '150px'
			img.id = "previewLogo"
		}
		reader.onerror = function(event) {
			selector("#displayLogo").textContent = "An error just occured"
		}
		reader.readAsDataURL(files) 
	}else{
		event.preventDefault() 
      	selector("#displayLogo").textContent = "File size too large or not supported."
	}
} 

function showStamp() {
	let files = this.files[0]  
    let acceptedFile = ["image/jpeg" , "image/jpg" , "image/png" , "image/gif"] 
    let divisor = 1024*1024
    let size = Number(files.size)/divisor
	let type = files.type 
	console.log(type)
	if (acceptedFile.includes(type)  && size  < 10) {
		let reader = new FileReader() 
		reader.onload = function(event) {
			selector(".hideStamp").style.display = "none"
			selector(".removeStamp").style.display = "block"
			let img = new Image() 
			img.onload = function() {
				selector("#displayStamp").append(img)
			}
			img.src = event.target.result 
			img.style.width = '150px'
			img.style.height = '150px'
			img.id = "previewStamp"
		}
		reader.onerror = function(event) {
			selector("#displayStamp").textContent = "An error just occured"
		}
		reader.readAsDataURL(files) 
	}else{
		event.preventDefault() 
      	selector("#displayStamp").textContent = "File size too large or not supported."
	}
}

let resetLogo = selector("#removeLogo")

resetLogo.addEventListener('click' , event => {
	event.preventDefault()
	let picture = selector("#logo")
	let displayImage = selector("#previewLogo")
	let hide = selector(".hideLogo")
	if(picture.value){
		picture.value = ""
		displayImage.parentNode.removeChild(displayImage)
		hide.style.display = "block"
	}
	selector(".removeLogo").style.display = "none"
})

let resetStamp = selector("#removeStamp")

resetStamp.addEventListener('click' , event => {
	event.preventDefault()
	let picture = selector("#stamp")
	let displayImage = selector("#previewStamp")
	let hide = selector(".hideStamp")
	if(picture.value){
		picture.value = ""
		displayImage.parentNode.removeChild(displayImage)
		hide.style.display = "block"
	}
	selector(".removeStamp").style.display = "none"
})

 