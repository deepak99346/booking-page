import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function initDatabase() {
  console.log("Connecting to MySQL to initialize database...");
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    });

    console.log("Connected to MySQL server!");

    const sqlScript = fs.readFileSync(path.join(process.cwd(), "database.sql"), "utf-8");
    await connection.query(sqlScript);

    console.log("Database and table initialized successfully!");
    await connection.end();
  } catch (err) {
    console.error("Failed to connect/initialize MySQL:", err.message);
    console.log("Note: Make sure your local MySQL service is running and credentials in .env are correct.");
  }
}

initDatabase();
