// require('dotenv').config()
import dotenv from 'dotenv';
import mongoose from "mongoose";
import connectDB from "./db/index.js";

dotenv.config ({
    path:'./env'
})

connectDB()














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

  