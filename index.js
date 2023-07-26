// import express from "express";

// const app = express();
// const port = 9000;
// app.use("/", (req, res) => {
//   res.json({ message: "Hello From Express App" });
// });

// app.listen(9000, () => {
//   console.log(`Starting Server on Port ${port}`);
// });
import express from "express";
import cors from "cors";
import moment from "moment/moment.js";
// --------------> DB setup <--------------
import mysql from 'mysql';
const dbUrl = process.env.REACT_APP_DB_URL;
// Create a new connection pool with your database URL
const dbConfig = new URL(dbUrl);
const db = mysql.createConnection({
  connectionLimit: 10, // Adjust this value based on your needs
  host: dbConfig.hostname,
  user: dbConfig.username,
  password: dbConfig.password,
  port: dbConfig.port,
  ssl: {
    // Set the SSL options
    rejectUnauthorized: false, // Set to false if you don't want to reject unauthorized connections
  },
  database: dbConfig.pathname.slice(1), // Remove the leading slash from the pathname
});

function createTable() {
  var sql=`
  CREATE TABLE IF NOT EXISTS records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    headID INT,
    isHead INT,
    name TEXT NOT NULL,
    fatherName TEXT,
    motherName TEXT,
    tehsil TEXT,
    district TEXT,
    dob Date,
    status TEXT
  )
`;
db.query(sql, function (err, result) {
  if (err) throw err;
  console.log("Table created");
  });
}
createTable();
// --------------> DB setup ends <--------------
const app = express();

app.use(express.json());
app.use(cors());

// API endpoint for fetching a single record by ID
app.get("/api/records/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM records WHERE id = ?", id, (err, record) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch record" });
      } else {
        if (!record) {
          res.status(404).json({ error: "Record not found" });
        } else {
          res.json(record);
        }
      }
    });
  });
  
  // API endpoint for fetching all records
  app.get("/api/headrecords", (req, res) => {
    db.query("SELECT * FROM records WHERE isHead = 1", (err, records) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch records" });
      } else {
        res.json(records);
      }
    });
  });

  app.get('/api/records', (req, res) => {
    db.query('SELECT * FROM records', (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch records' });
      } else {
        res.json(rows);
      }
    });
  });

  app.get("/api/records/family/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM records WHERE headID = ? or id= ?", [id, id],(err, records) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch record" });
      } else {
        if (!records) {
          res.status(404).json({ error: "Record not found" });
        } else {
          res.json(records);
        }
      }
    });
  });

  
  app.post("/api/records", (req, res) => {
    const record = req.body;
    const dob = moment(record.dob).format("YYYY-MM-DD")
    db.query(
      `INSERT INTO records (
        name, 
        fatherName, 
        motherName, 
        tehsil, 
        district, 
        dob, 
        status, 
        isHead, 
        headID,

        gotra,
        education,
        profession,
        relation,

        mvillage,
        village,
        paddress,
        raddress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.name,
        record.fatherName,
        record.motherName,
        record.tehsil,
        record.district,
        dob,
        record.status,
        record.isHead,
        record.headID, // Ensure headID is set properly if provided

        record.gotra,
        record.education,
        record.profession,
        record.relation,

        record.mvillage,
        record.village,
        record.paddress,
        record.raddress,
      ],
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to add record" });
        } else {
          res.sendStatus(201);
        }
      }
    );
  });
  
  // API endpoint for updating an existing record
  app.put("/api/records/:id", (req, res) => {
    const id = req.params.id;
    const record = req.body;
    const dob = moment(record.dob).format("YYYY-MM-DD")
    db.query(
      `UPDATE records SET 
      name = ?, 
      fatherName = ?, 
      motherName = ?, 

      mvillage=?, 
      village=?, 
      tehsil = ?, 
      district = ?, 
      paddress=?, 
      raddress=?, 
      
      mobilenumber=?,
      gotra=?, 
      dob = ?, 
      status = ?,

      relation=?,
      education=?,
      profession=?, 
      
      isHead = ?, 
      headID = ? WHERE id = ?`,
      [
        record.name,
        record.fatherName,
        record.motherName,

        record.mvillage,
        record.village,
        record.tehsil,
        record.district,
        record.paddress,
        record.raddress,

        record.mobilenumber,
        record.gotra,
        dob,
        record.status,

        record.relation,
        record.education,
        record.profession,

        record.isHead,
        record.headID, // Ensure headID is set properly if provided
        id,
      ],
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to update record" });
        } else {
          res.sendStatus(200);
        }
      }
    );
  });

// API endpoint for deleting a record
app.delete("/api/records/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM records WHERE id = ?", id, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete record" });
    } else {
      res.sendStatus(200);
    }
  });
});

// Start the server
app.listen(9000, () => {
  console.log("Server started on port 9000");
});
