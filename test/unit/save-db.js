import "babel-polyfill";

import {expect} from "chai";
import sinon from "sinon";

import getDb from "services/db";

import {insertConsumption} from "steps/save-db";
import {createTestDB} from "../../scripts/create-tables";

describe("Save consumption into DB", () => {

    const db = getDb();

    sinon.useFakeTimers();

    before(async () => {
        await db.query(createTestDB);
        await db.query({
            text: "DELETE FROM meter"
        });
        await db.query(
            "INSERT INTO meter (id, meter_code) VALUES ($1, $2)",
            "1", "ANZ01"
        );
    });

    afterEach(async () => {
        await db.query({
            text: "DELETE FROM consumption"
        });
    });

    after(async () => {
        await db.query({
            text: "DELETE FROM meter"
        });
    });

    it("Save ANZ01 consumption [CASE 0]", async () => {
        const consumptionEvent = {
            sensorId: "ANZ01",
            date: new Date(),
            measurements: [{
                type: "reactiveEnergy",
                value: 180,
                unitOfMeasurement: "kVArh"
            }, {
                type: "activeEnergy",
                value: 132,
                unitOfMeasurement: "kWh"
            }, {
                type: "maxPower",
                value: 1,
                unitOfMeasurement: "kW"
            }]
        };

        await insertConsumption(consumptionEvent);

        const sequence = await db.row("SELECT last_value FROM consumption_id_seq");
        const result = await db.rows("SELECT * FROM consumption");
        const meter = await db.row(
            "SELECT id FROM meter WHERE meter_code = $1",
            consumptionEvent.sensorId
        );

        expect(result).to.deep.equal([{
            active_energy: "132.0000",
            max_power: "1.0000",
            reactive_energy: "180.0000",
            id: parseInt(sequence.last_value),
            meter_id: meter.id,
            date: new Date(),
            time: "00:00:00"
        }]);
    });

    it("Save ANZ01 consumption [CASE 1: maxPower missing]", async () => {
        const consumptionEvent = {
            sensorId: "ANZ01",
            date: new Date(),
            measurements: [{
                type: "reactiveEnergy",
                value: 180,
                unitOfMeasurement: "kVArh"
            }, {
                type: "activeEnergy",
                value: 132,
                unitOfMeasurement: "kWh"
            }]
        };

        await insertConsumption(consumptionEvent);

        const sequence = await db.row("SELECT last_value FROM consumption_id_seq");
        const result = await db.rows("SELECT * FROM consumption");
        const meter = await db.row(
            "SELECT id FROM meter WHERE meter_code = $1",
            consumptionEvent.sensorId
        );

        expect(result).to.deep.equal([{
            active_energy: "132.0000",
            max_power: null,
            reactive_energy: "180.0000",
            id: parseInt(sequence.last_value),
            meter_id: meter.id,
            date: new Date(),
            time: "00:00:00"
        }]);
    });

    it("Save ANZ01 consumption [CASE 2: skip since another measurement is saved]", async () => {
        const consumptionEvent = {
            sensorId: "ANZ01",
            date: new Date(),
            measurements: [{
                type: "reactiveEnergy",
                value: 180,
                unitOfMeasurement: "kVArh"
            }, {
                type: "activeEnergy",
                value: 132,
                unitOfMeasurement: "kWh"
            }]
        };

        await insertConsumption(consumptionEvent);

        const sequence = await db.row("SELECT last_value FROM consumption_id_seq");
        const result = await db.rows("SELECT * FROM consumption");
        const meter = await db.row(
            "SELECT id FROM meter WHERE meter_code = $1",
            consumptionEvent.sensorId
        );

        expect(result).to.deep.equal([{
            active_energy: "132.0000",
            max_power: null,
            reactive_energy: "180.0000",
            id: parseInt(sequence.last_value),
            meter_id: meter.id,
            date: new Date(),
            time: "00:00:00"
        }]);

        await insertConsumption(consumptionEvent);
        const resultSkip = await db.rows("SELECT * FROM consumption");

        expect(resultSkip).to.deep.equal([{
            active_energy: "132.0000",
            max_power: null,
            reactive_energy: "180.0000",
            id: parseInt(sequence.last_value),
            meter_id: meter.id,
            date: new Date(),
            time: "00:00:00"
        }]);
    });
});
