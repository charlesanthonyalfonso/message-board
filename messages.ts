export {};
const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");

const app = express();

const MESSAGES_TABLE = process.env.MESSAGES_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get("/messages", async function (req, res) {
    console.log('REQUEST', req)
    const params = {
        TableName: MESSAGES_TABLE
    };

    try {
        const { Items } = await dynamoDbClient.scan(params).promise();
        if (Items) {
            res.json(Items);
        } else {
            res.status(404).json({ error: 'Could not find any messages"' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not retreive messages" });
    }
});

app.post("/messages", async function (req, res) {
    console.log('REQUEST', req)
    const { 
        messageId, 
        userId, 
        boardId, 
        message 
    } = req.body;

    if (typeof boardId !== "string") {
        res.status(400).json({ error: '"boardId" must be a string' });
    } else if (typeof messageId !== "string") {
        res.status(400).json({ error: '"messageId" must be a string' });
    } else if (typeof userId !== "string") {
        res.status(400).json({ error: '"userId" must be a string' });
    } else if (typeof message !== "string") {
        res.status(400).json({ error: '"message" must be a string' });
    }

    const params = {
        TableName: MESSAGES_TABLE,
        Item: {
            messageId: messageId,
            boardId: boardId,
            userId: userId,
            message: message,
            createdAt: (new Date()).toISOString(),
        },
    };

    try {
        await dynamoDbClient.put(params).promise();
        res.json({ 
            messageId, 
            userId, 
            boardId, 
            message 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not create message to the board" });
    }
});

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});


module.exports.handler = serverless(app);
