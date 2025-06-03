import path from 'path';
import express from 'express';
import cors from 'cors';
import colors from 'colors'
import dotenv from 'dotenv';
dotenv.config({ silent: process.env.NODE_ENV === "production" });

import { connectDB } from './config/db.js';
import { fileURLToPath } from 'url';

import accessroutes from './routes/AccessRoutes.js';
import profileroutes from './routes/ProfileRoutes.js';
import categoryroutes from './routes/CategoryRoutes.js';
import notesroutes from './routes/NoteRoutes.js';
import taskroutes from './routes/TaskRoutes.js';

const port = process.env.PORT || 5000;
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
connectDB();
const app = express();
const corsOpts = {
    origin: "*"
};
app.use(cors(corsOpts));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/", accessroutes);
app.use("/profile", profileroutes);
app.use("/category", categoryroutes);
app.use("/notes", notesroutes);
app.use("/task", taskroutes);

app.listen(port, () => console.log(`Server started on port ${port}`));