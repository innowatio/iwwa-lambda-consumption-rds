import log from "../services/logger";
import getDb from "../services/db";

export async function insertConsumption(consumptionEvent) {
    const activeEnergy = consumptionEvent.measurements.find(x => x.type == "activeEnergy");
    const reactiveEnergy = consumptionEvent.measurements.find(x => x.type == "reactiveEnergy");
    const maxPower = consumptionEvent.measurements.find(x => x.type == "maxPower");

    const db = getDb();

    try {
        const savedSensor = await db.row(
            "SELECT id FROM meter WHERE meter_code = $1",
            consumptionEvent.sensorId
        );

        try {

            const savedConsumption = await db.row(
                "SELECT id FROM consumption WHERE meter_id = $1 AND DATETIME = $2",
                savedSensor.id,
                consumptionEvent.date
            );

            log.info({
                activeEnergy,
                reactiveEnergy,
                maxPower,
                savedConsumption
            }, "update-db");

            if (reactiveEnergy) {
                await db.query(
                    "UPDATE consumption SET reactive_energy = $1 WHERE id = $2",
                    reactiveEnergy.value,
                    savedConsumption.id
                );
            }

            if (maxPower) {
                await db.query(
                    "UPDATE consumption SET max_power = $1 WHERE id = $2",
                    maxPower.value,
                    savedConsumption.id
                );
            }

            if (activeEnergy) {
                await db.query(
                    "UPDATE consumption SET active_energy = $1 WHERE id = $2",
                    activeEnergy.value,
                    savedConsumption.id
                );
            }

        } catch (error) {
            const params = [
                savedSensor.id,
                consumptionEvent.date,
                activeEnergy ? activeEnergy.value : null,
                reactiveEnergy ? reactiveEnergy.value : null,
                maxPower ? maxPower.value : null
            ];
            log.info({params}, "insert-db");
            await db.query(
                "INSERT INTO consumption (meter_id, datetime, active_energy, reactive_energy, max_power) VALUES ($1, $2, $3, $4, $5)",
                ...params,
            );
        }
    } catch (error) {
        log.info(`Sensor "${consumptionEvent.sensorId}" not found on database. Skip execution`);
    }
}
