const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");

const app = express();

const BOARDS_TABLE = process.env.BOARDS_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get("/boards", async function (req, res) {
    console.log('REQUEST', req)
    const params = {
        TableName: BOARDS_TABLE
    };

    try {
        const { Items } = await dynamoDbClient.scan(params).promise();
        if (Items) {
            res.json(Items);
        } else {
            res.status(404).json({ error: 'Could not find any boards"' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not retreive boards" });
    }
});

app.post("/boards", async function (req, res) {
    console.log('REQUEST', req)
    const { boardId, name } = req.body;
    if (typeof boardId !== "string") {
        res.status(400).json({ error: '"boardId" must be a string' });
    } else if (typeof name !== "string") {
        res.status(400).json({ error: '"name" must be a string' });
    }

    const params = {
        TableName: BOARDS_TABLE,
        Item: {
            boardId: boardId,
            name: name,
        },
    };

    try {
        await dynamoDbClient.put(params).promise();
        res.json({ boardId, name });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not create user" });
    }
});

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});


module.exports.handler = serverless(app);
