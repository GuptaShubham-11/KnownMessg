import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

let connection: ConnectionObject = {};

export default async function dbToConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to DB");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {
            dbName: "knownmessg",
        });

        connection.isConnected = db.connections[0].readyState;
        console.log("Connected to DB");
    } catch (error) {
        console.log("Error connecting to DB", error);
        process.exit(1);
    }
}