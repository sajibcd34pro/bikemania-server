const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
// const admin = require("firebase-admin");

const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000


//middleware
app.use(cors());
app.use(express.json());

//db
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xhckh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri)

async function run() {
    try {
        await client.connect();
        const database = client.db('bikeMania');
        const productsCollection = database.collection('products')
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('review');
        const ordersCollection = database.collection('orders')    
        
        //add or create products
        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productsCollection.insertOne(products);
            res.json(result)
        })

        //get all products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray({});
            res.json(result);
        })
        
        //get single products api
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        // delete single product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);

            res.json(result);
        });


        // update single products api
        app.put('/products/:id', async (req, res) => {
            const { name, price, img } = req.body;
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateProduct = {
                $set: {
                    name,
                    price,
                    img
                },
            };

             const result = await productsCollection.updateOne(query, updateProduct, options);
            res.json(result);
        });



        //add or create single review
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);

        })
        
         //get review 
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray({});
            res.json(result);
        })
        
        //submit orders collection 
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);

        })
        //get all orders
        app.get('/order', async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray({});
            res.json(result)
        })


    
        // get order by email 
        app.get("/order/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await ordersCollection.find(query).toArray();
            res.json(result);
        });

        app.delete("/order/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query)
            res.json(result);
        })
        
        // update order status 
        app.put("/order/:id", async (req, res) => {
            const { status } = req.body;
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateStatus = {
                $set: {
                    status
                },
            };
         
            const result = await ordersCollection.updateOne(query, updateStatus, options);
            res.json(result);
        })

        // add logged in user api 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        //upsert user information for google logged in
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // add admin api 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = {email : user.email};
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        //check admin api 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })

  }

    
    

    
    finally {
        // await client.close();
    }

 }



run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Bike Mania')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})