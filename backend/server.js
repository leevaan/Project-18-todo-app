"use strict"
// postGressSQL
import pg from 'pg';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path  from 'path';
import dotenv from 'dotenv';

// jommonJS დან ESModule ში გადასაყვანი ბმული.
import { fileURLToPath } from 'url';
// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 4000;
const { Pool } = pg;
//  .config() ეს მეთოდი .env ფაილიდან ყველა ცვლადს ჩატვირთავს და დაამატებს მათ process.env ობიექტში.
dotenv.config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})

const app = express();
app.use(bodyParser.json());
app.use(cors())
// მოძებნე ფაილები frontend საქაღალდეში.
app.use(express.static(path.join(__dirname, '../frontend')));

// Route: Root URL -> index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});
app.get("/api/todos", async(req, res, next) => {
    try{
        const client = await pool.connect();
        // ვიღებ ბაზიდან ინფორმაციას 
        const  result = await client.query({
            text:'SELECT * FROM todoapp ORDER BY todo_position ASC;'
        }); 
        // release();  კავშირის გთავისუფლდება, დასრულება ბაზასთან.
        client.release();
        res.status(200).json(result.rows);

    } catch(err){
        // console.error(err);
        res.status(500).json({error: "Server Error", details: err.message });
    }
});

app.post("/", async (req, res, next) => {
    // ბადი პარსერი გაპარასვს ბოდის და მოგვცემს json ფაილად.
    const reqTodo = req.body;
    //  ვუკავშირედბ  command 'cmp' from deb diffutils (1:3.10-1) ბაზას
    try{
        const client = await pool.connect();
        // ვწერთ ბაზაში ინფორმაციას 
        const result = await client.query({
            text:'INSERT INTO todoapp (users_todo, todo_id) VALUES($1, $2);',
            values: [reqTodo.users_todo, BigInt(reqTodo.todo_id)]
        }); 
        // release();  კავშირის გთავისუფლდება, დასრულება ბაზასთან.
        client.release();
        res.status(200).json({ message: "send POST is working" });
    } catch(err){
        res.status(500).json({ error: "Server Error", details: err.message });
    }
   
});

// app.put("/:id", async (req, res, next) => {
//     const id = req.params.id;
//     const activeCompleted = req.body.active_completed;  // იმის დასაკონტროლებლად თუ რა უნდა შეცვალოს
    
//     try{
//     const client = await pool.connect();
//     const result = await client.query({
//         text: 'UPDATE todoapp SET active_completed = $1 WHERE todo_id = $2;',
//         values: [activeCompleted, id]
//     })
//     // release();  კავშირის გთავისუფლდება, დასრულება ბაზასთან.
//     client.release(); 
//     res.status(200).json({ message: "Update successful" });
//    } catch(err) {
//     res.status(500).json({ error: "Server Error", details: err.message });
//    }
// });

app.put("/", async (req, res, next) => {
    const { type, data } = req.body;

    let client;
    try {
       client = await pool.connect();
        if (type === "update-single") {
            // ობიექტის დესტრუქტურიზაცია
            const { todo_id, active_completed } = data;
            
            await client.query({
                text: 'UPDATE todoapp SET active_completed = $1 WHERE todo_id = $2;',
                values: [active_completed, todo_id]
            });
        } else if (type === "update-bulk") {
            // BEGIN დაიწყე მონაცემების ერთიანად ჩაწერა. თუ ტრანზაქციაში რაიმე შეცდომა მოხდება, ბაზაში ნახევრად არაფერი ჩაიწერება.
            await client.query('BEGIN');
            for (const {todo_id,  todo_position} of data) {
                await client.query({
                text: 'UPDATE todoapp SET todo_position = $1 WHERE todo_id = $2;',
                values: [todo_position,todo_id]
                });
            }
            // COMMIT ადასტურებს მონაცემების წარმატებით დამუშვებსს და წერს ბაზაში. თუ ტრანზაქციაში რაიმე შეცდომა მოხდება, ბაზაში ნახევრად არაფერი ჩაიწერება.
            await client.query('COMMIT');
        }

        res.status(200).json({ message: "Update successful" });
    } catch (err) {
        console.error("Error:", err);

        if (type === "update-bulk" && client) {
            await client.query('ROLLBACK'); // შეცდომის შემთხვევაში, ტრანზაქციის გაუქმება
        }

        res.status(500).json({ error: "Server Error", details: err.message });
    } finally {
        if (client) {
            client.release(); // კავშირის დახურვა ნებისმიერ შემთხვევაში
        }
    }
});

app.delete("/", async (req, res, next) => {
    const { type, data } = req.body;

    let client = await pool.connect();
    try {
        let result;

        if (type === "delete-single") {
            // ობიექტის დესტრუქტურიზაცია
            const { todo_id } = data;
          
            result = await client.query('DELETE FROM todoapp WHERE todo_id = $1 RETURNING *;', [todo_id]);
            
            // rowCount ითვლის და აბრუნებს მონაცემთა ბაზაში როების რაოდენობას.
            if (result.rowCount === 0) {
               return res.status(404).json({ message: "Item not found" });
            }
        } else if (type === "delete-bulk") {
            // BEGIN დაიწყე მონაცემების ერთიანად ჩაწერა. თუ ტრანზაქციაში რაიმე შეცდომა მოხდება, ბაზაში ნახევრად არაფერი ჩაიწერება.
            await client.query('BEGIN');

            let totalDeleted = 0; // ცვლილებების ჯამი
            for (const { todo_id } of data) {
                 result = await client.query('DELETE FROM todoapp WHERE todo_id = $1 RETURNING *;', [todo_id]);
                 if (result.rowCount > 0) {
                    totalDeleted += 1;
                }
            }
            // rowCount ითვლის და აბრუნებს მონაცემთა ბაზაში როების რაოდენობას.
            if (totalDeleted === 0) {
                return res.status(404).json({ message: "Item not found" });
            }
            // COMMIT ადასტურებს მონაცემების წარმატებით დამუშვებსს და წერს ბაზაში. თუ ტრანზაქციაში რაიმე შეცდომა მოხდება, ბაზაში ნახევრად არაფერი ჩაიწერება.
            await client.query('COMMIT');
        }
        // წარმატებით დასრულების შემდეგ დაბრუნება
        res.status(200).json({ message: "Delete successful", deletedItem: result.rows[0] });
    } catch (error) {
        console.error("Error in DELETE:", error);

        if (type === "delete-bulk" && client) {
            await client.query('ROLLBACK'); // შეცდომის შემთხვევაში, ტრანზაქციის გაუქმება
        }
        res.status(500).json({ message: "Server error", error: error.message });
    } finally {
        if (client) {
            client.release(); // კავშირის დახურვა ნებისმიერ შემთხვევაში
        }
    }
});
// app.delete("/:id", async (req, res, next) => {
//     const { id } = req.params;
//     try {
//         const result = await pool.query('DELETE FROM todoapp WHERE todo_id = $1 RETURNING *;', [id]);
//         // rowCount ითვლის და აბრუნებს მონაცემთა ბაზაში როების რაოდენობას.
//         if (result.rowCount === 0) {
//             return res.status(404).json({ message: "Item not found" });
//         }

//         res.status(200).json({ message: "Delete successful", deletedItem: result.rows[0] });
//     } catch (error) {
//         console.error("Error in DELETE:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
