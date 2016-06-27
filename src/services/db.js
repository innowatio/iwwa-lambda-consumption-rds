import PgAsync from "pg-async";

import {
    DB_USER,
    DB_PASS,
    DB_URL,
    DB_NAME
} from "../config";

var db;

export default function getClient () {
    if (!db) {
        db = new PgAsync(`postgres://${DB_USER}:${DB_PASS}@${DB_URL}/${DB_NAME}`);
    }
    return db;
}