import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const client = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vyznij5.mongodb.net/`);

export async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");
        return client;
    } catch (err) {
        console.dir(err);
    }
}

const connectedClient = await connectToMongoDB();
const database = connectedClient.db("hireloopdb");
const users = database.collection("user");
const jobs = database.collection("jobs");

app.get('/', (req, res) => {
    res.send('hire loop is looping')
})


app.get('/users', async (req, res) => {
    const cursor = users.find({});
    const result = await cursor.toArray();
    res.send(result);
})


// jobs related apis
app.get('/jobs', async (req, res) => {

    const query = {};
    // console.log('query', req.query);
    if (req.query) {
        if (req.query.jobType) {
            query.jobType = req.query.jobType;
        }
        if (req.query.isRemote) {
            query.isRemote = req.query.isRemote === 'true';
        }
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { company: { $regex: req.query.search, $options: 'i' } },
                { responsibilities: { $regex: req.query.search, $options: 'i' } },
                { requirements: { $regex: req.query.search, $options: 'i' } }
            ];
        }
    }

    const cursor = jobs.find(query);
    const result = await cursor.toArray();
    res.send(result);
})


app.post('/jobs', async (req, res) => {
    const job = req.body;
    const result = await jobs.insertOne(job);
    res.send(result);
})


app.delete('/jobs/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await jobs.deleteOne(query);
    res.send(result);
})

app.listen(port, () => {
    console.log(`hire loop is running on port ${port}`)
})
