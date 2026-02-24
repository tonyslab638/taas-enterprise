import { MongoClient } from "mongodb"

const uri = "mongodb://127.0.0.1:27017"
const client = new MongoClient(uri)

export async function connectDB(){
 if(!client.topology?.isConnected()){
  await client.connect()
 }
 return client.db("taas")
}