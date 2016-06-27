import moment from "moment";

import log from "../services/logger";
import getDb from "../services/db";

export async function insertConsumption (consumptionEvent) {
    const now = moment.utc(consumptionEvent.date).valueOf();
    const normalizedDate = moment.utc(now - (now % (1000 * 60 * 5)));

    const db = getDb();

    try {
        const savedSensor = await db.row(
            "SELECT id FROM meter WHERE meter_code = $1",
            consumptionEvent.sensorId
        );

        const savedConsumption = await db.rows(
            "SELECT id FROM consumption WHERE meter_id = $1 AND TIME = $2",
            savedSensor.id,
            normalizedDate.format("YYYY-MM-DD HH:mm:ss")
        );

        if (0 === savedConsumption.length) {
            const activeEnergy = consumptionEvent.measurements.find(x => x.type == "activeEnergy");
            const reactiveEnergy = consumptionEvent.measurements.find(x => x.type == "reactiveEnergy");
            const maxPower = consumptionEvent.measurements.find(x => x.type == "maxPower");
            const params = [
                savedSensor.id,
                normalizedDate,
                normalizedDate.format("YYYY-MM-DD HH:mm:ss"),
                activeEnergy ? activeEnergy.value : null,
                reactiveEnergy ? reactiveEnergy.value : null,
                maxPower ? maxPower.value : null
            ];
            log.info({params}, "insert-db");
            await db.query(
                "INSERT INTO consumption (meter_id, date, time, active_energy, reactive_energy, max_power) VALUES ($1, $2, $3, $4, $5, $6)",
                ...params,
            );
        } else {
            log.info("Skipping since a measurement is already saved into DB");
        }
    } catch (error) {
        log.info(error, "insert-db");
    }
}