
const util = require("util") 
const GoogleCloud = require("@google-cloud/storage") 
const path        = require("path") 
const serviceKey  = path.join(__dirname , "./skoolnetics.json") 

const {Storage} = GoogleCloud 

const storage   = new Storage({
    keyFilename : serviceKey , 
    projectId : "school-298019"
})
const bucket = storage.bucket("skoolnetics") 

class CelchinStorage { 
    createBucket = async (bucketName , storageClass, region = "Asia") => {
        try {
            const [bucket] = await storage.createBucket(bucketName , {
                location : region , 
                storageClass : storageClass
            }) 
            if (!bucket) throw new Error(`Unable to create the bucket ${bucketName}`) 
            return `${bucketName} was created` 
        }catch(error){
            return {
                message :  error.message 
            }
        }
    } 
    deleteBucket = async (bucketName ) => {
        try {
            if (await storage.bucket(bucketName).delete()){
                return `${bucketName} was deleted`
            }
            throw new Error(`Unable to perform delete on ${bucketName}`)
        }catch(error){
            return {
                message :  error.message 
            }
        }
    } 
    addBucketMember = async (bucketName ,  roleName , member) => { 
        try {
            const bucket = await storage.bucket(bucketName) 
            const [policy] = await bucket.iam.getPolicy({requestedPolicyVersion: 3});

            // Adds the new roles to the bucket's IAM policy
            policy.bindings.push({
            role: roleName,
            members: member,
            })

            // Updates the bucket's IAM policy
            if(await bucket.iam.setPolicy(policy)){
                return `Added ${member} with ${roleName} to ${[bucket]}`
            } 
            throw new Error("Unable to add the member")  
        }catch(error){
            return {
                message :  error.message 
            }
        }
    } 
    listBuckets = async () => {
        try {
           const [buckets] = await storage.getBuckets()
           if (buckets) return buckets 
           throw new Error("Issues occured") 
        }catch(error){
            return {
                message :  error.message 
            }
        }
        
    } 
    listFiles = async (bucketName) => {
        try {
           const [files] = await storage.bucket(bucketName).getFiles();
           if (files) return files 
           throw new Error("Issues occured") 
        }catch(error){
            return {
                message :  error.message 
            }
        }
        
    }
    uploadImage = (file, text, buck) => new Promise((resolve , reject) => {
        const {originalname , buffer} =  file 
        let filename = text + originalname
        const bucket = storage.bucket(buck)
        const blob = bucket.file(filename.replace(/ /g , "_")) 
        const blobStream = blob.createWriteStream({
            resumable : false
        }) 
        blobStream.on("finish" , () => {
            const publicUrl = util.format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`) 
            resolve(publicUrl)
        }) 
        .on("error" , () => {
            reject("Unable to upload image something went wrong")
        }) 
        .end(buffer)
    }) 
    deleteFile = async (fileName) => await bucket.file(fileName).delete()
}


module.exports  = new CelchinStorage()