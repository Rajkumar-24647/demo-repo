import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import { userMiddleware } from "./auth.js";
import { configDotenv } from "dotenv";
const JWT_SECRET = "abcd@abcd";
const app = express();
const client = new PrismaClient();
// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
//   Credentials: true
// }
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD"
}));
app.use(express.json());
app.post("/user/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const ExistedUser = await client.user.findUnique({
            where: {
                username: username,
            },
        });
        if (ExistedUser)
            return res.status(403).send({ Alert: "User already existed..." });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await client.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).send({
            msg: "User created successfully",
        });
    }
    catch (error) {
        console.error("Signup error", error);
        res.status(402).send({
            msg: "Something went wrong",
        });
    }
});
app.post("/user/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await client.user.findUnique({
            where: {
                username,
            },
        });
        if (!user)
            return res.status(403).send({ alert: "User doesn't exist..." });
        const comparedPassword = await bcrypt.compare(password, user.password);
        if (comparedPassword) {
            const token = jwt.sign({
                id: user.id,
                username: user.username,
            }, JWT_SECRET, { expiresIn: "6h" });
            res.status(201).send({
                token: token,
            });
        }
        else {
            res.status(403).json({
                msg: "Invalid Incredentials.",
            });
        }
    }
    catch (error) {
        console.error("Error is here..", error);
        res.status(403).json({
            msg: "Something went wrong....",
        });
    }
});
app.post("/user/todo", userMiddleware, async (req, res) => {
    //@ts-ignore
    const id = req.userId;
    try {
        const { title, description, userId } = req.body;
        const todo = await client.todos.create({
            data: {
                title,
                description,
                userId: id
            },
        });
        res.status(201).json({
            todo: todo
        });
    }
    catch (error) {
        console.error("Somehting is wrong", error);
        res.status(403).json({
            msg: "Something is Wrong.Please try again after some time",
        });
    }
});
app.get("/user/todos", userMiddleware, async (req, res) => {
    //@ts-ignore
    const id = req.userId;
    const todos = await client.todos.findMany({
        where: {
            userId: id
        }
    });
    res.json({
        todos
    });
});
app.put("/user/update/todo/:todoId", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const { todoId } = req.params;
    const { title, description } = req.body;
    try {
        const updatedTodo = await client.todos.updateMany({
            where: {
                id: Number(todoId),
                userId: userId
            },
            data: {
                title,
                description
            }
        });
        res.status(201).json({
            updatesTodo: updatedTodo
        });
    }
    catch (error) {
        console.error("Error", error);
    }
});
app.delete("/user/delete/todo/:todoId", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const { todoId } = req.params;
    const deletedTodo = await client.todos.deleteMany({
        where: {
            id: Number(todoId),
            userId: Number(userId)
        }
    });
    if (deletedTodo.count === 0)
        return res.json({ msg: "Todo doesn't exist" });
    res.status(201).json({
        msg: "Deleted successfully",
        DeletedTodo: deletedTodo.count
    });
});
app.listen(3000, () => {
    console.log("server is alive...");
});
//# sourceMappingURL=index.js.map