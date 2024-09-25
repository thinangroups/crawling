import { createReadStream } from "fs";
import * as csv from 'csv-parser';

export async function csvReader(filename){
    return new Promise((resolve,reject)=>{
        let datas = [];
        const read = createReadStream(filename).pipe(csv());

        read.on('data',async function (row:any) {
            datas.push(row);
        });

        read.on('close', async function(){
            console.log("totalnumber of rows", datas.length)
            return resolve(datas);
        })

        read.on('error', function(err){
            console.log("Error while reading file", err);
        })
    })
}