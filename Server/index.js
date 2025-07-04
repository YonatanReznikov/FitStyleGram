const express = require("express");
const { connect } = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const upload = require("express-fileupload");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const routes = require('./routes/routes');
const{ server, app} = require("./socket/socket")
const statsRoutes = require('./routes/statsRoutes');



// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: ["http://localhost:5173"] 
}));

app.use(upload());
app.use('/api', routes);



app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);




connect(process.env.MONGO_URL).then(server.listen(process.env.PORT, ()=> console.log
(`Server started on port ${process.env.PORT}`))).catch(err => console.log(err))