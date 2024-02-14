// require('dotenv').config()
import dotenv from 'dotenv';
import mongoose from "mongoose";
import { app } from './app.js';
import connectDB from "./db/index.js";

dotenv.config ({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is listening on ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.error(err)
})














// const app = express();

// (
//     async ()=>{
//         try{
//             await mongoose.connect(`${process.env.MONGODB.URI}/${DB_NAME}`);
//             app.on('error',(error)=>{
//                 console.log(error)
//             })
//             app.listen(process.env.PORT,()=>{
//                 console.log(`App listening on ${process.env.PORT}`)
//             })
//         }
//         catch(error){
//             console.log(error);
//         }
//     }
// )()

  