import { MongoClient } from "mongodb"

const uri = "mongodb+srv://smdjubair1_db_user:o3al5wbvFVP0pxll@cluster0.py41n3q.mongodb.net/?appName=Cluster0"

const client = new MongoClient(uri)

let db

export async function connectDB(){
  if(db) return db
  await client.connect()
  db = client.db("taas")
  console.log("✅ MongoDB Connected")
  return db
}