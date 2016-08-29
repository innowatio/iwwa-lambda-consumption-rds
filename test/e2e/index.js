import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import {getEventFromObject} from "../mocks";
import {handler} from "index";
import getDb from "services/db";
import {createTestDB} from "../../scripts/create-tables";

describe("Save consumptionEvent on RDS", () => {

    const context = {
        succeed: sinon.spy(),
        fail: sinon.spy()
    };

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
        context.succeed.reset();
        context.fail.reset();
        await db.query({
            text: "DELETE FROM consumption"
        });
    });

    it("Skip event [CASE 0: no measurements field]", async () => {
        const consumptionEvent = {
            id: "eventId",
            data: {
                element: {
                    sensorId: "ANZ01",
                    source: "reading",
                    date: new Date()
                },
                id: "consumption-01"
            },
            type: "element inserted in collection readings"
        };
        await handler(getEventFromObject(consumptionEvent), context);
        expect(context.succeed).to.have.been.callCount(1);
        expect(context.fail).to.have.been.callCount(0);

        const result = await db.rows("SELECT * from consumption");
        expect(result.length).to.be.equal(0);
    });

    it("Skip event [CASE 1: wrong measurements field]", async () => {
        const consumptionEvent = {
            id: "eventId",
            data: {
                element: {
                    sensorId: "ANZ01",
                    date: new Date(),
                    measurements: [{
                        type: "weather-id",
                        value: 10,
                        source: "reading",
                        unitOfMeasurement: "kWh"
                    }]
                },
                id: "consumption-01"
            },
            type: "element inserted in collection readings"
        };
        await handler(getEventFromObject(consumptionEvent), context);
        expect(context.succeed).to.have.been.callCount(1);
        expect(context.fail).to.have.been.callCount(0);

        const result = await db.rows("SELECT * from consumption");
        expect(result.length).to.be.equal(0);
    });

    it("Skip event [CASE 2: wrong sensorId]", async () => {
        const consumptionEvent = {
            id: "eventId",
            data: {
                element: {
                    sensorId: "ANZ02",
                    date: new Date(),
                    source: "reading",
                    measurements: [{
                        type: "activeEnergy",
                        value: 10,
                        unitOfMeasurement: "kWh"
                    }, {
                        type: "reactiveEnergy",
                        value: 15,
                        unitOfMeasurement: "kVArh"
                    }, {
                        type: "maxPower",
                        value: 800,
                        unitOfMeasurement: "kW"
                    }]
                },
                id: "consumption-01"
            },
            type: "element inserted in collection readings"
        };
        await handler(getEventFromObject(consumptionEvent), context);
        expect(context.succeed).to.have.been.callCount(1);
        expect(context.fail).to.have.been.callCount(0);

        const result = await db.rows("SELECT * from consumption");
        expect(result.length).to.be.equal(0);
    });

    it("Skip event [CASE 3: no source]", async () => {
        const consumptionEvent = {
            id: "eventId",
            data: {
                element: {
                    sensorId: "ANZ02",
                    date: new Date(),
                    measurements: [{
                        type: "activeEnergy",
                        value: 10,
                        unitOfMeasurement: "kWh"
                    }, {
                        type: "reactiveEnergy",
                        value: 15,
                        unitOfMeasurement: "kVArh"
                    }, {
                        type: "maxPower",
                        value: 800,
                        unitOfMeasurement: "kW"
                    }]
                },
                id: "consumption-01"
            },
            type: "element inserted in collection readings"
        };
        await handler(getEventFromObject(consumptionEvent), context);
        expect(context.succeed).to.have.been.callCount(1);
        expect(context.fail).to.have.been.callCount(0);

        const result = await db.rows("SELECT * from consumption");
        expect(result.length).to.be.equal(0);
    });

    it("Skip event [CASE 4: wrong source]", async () => {
        const consumptionEvent = {
            id: "eventId",
            data: {
                element: {
                    sensorId: "ANZ02",
                    date: new Date(),
                    source: "forecast",
                    measurements: [{
                        type: "activeEnergy",
                        value: 10,
                        unitOfMeasurement: "kWh"
                    }, {
                        type: "reactiveEnergy",
                        value: 15,
                        unitOfMeasurement: "kVArh"
                    }, {
                        type: "maxPower",
                        value: 800,
                        unitOfMeasurement: "kW"
                    }]
                },
                id: "consumption-01"
            },
            type: "element inserted in collection readings"
        };
        await handler(getEventFromObject(consumptionEvent), context);
        expect(context.succeed).to.have.been.callCount(1);
        expect(context.fail).to.have.been.callCount(0);

        const result = await db.rows("SELECT * from consumption");
        expect(result.length).to.be.equal(0);
    });

    it("Skip event [CASE 3: no source]", async () => {
        const consumptionEvent = {
            id: "eventId",
            data: {
                element: {
                    sensorId: "ANZ02",
                    date: new Date(),
                    measurements: [{
                        type: "activeEnergy",
                        value: 10,
                        unitOfMeasurement: "kWh"
                    }, {
                        type: "reactiveEnergy",
                        value: 15,
                        unitOfMeasurement: "kVArh"
                    }, {
                        type: "maxPower",
                        value: 800,
                        unitOfMeasurement: "kW"
                    }]
                },
                id: "consumption-01"
            },
            type: "element inserted in collection readings"
        };
        await handler(getEventFromObject(consumptionEvent), context);
        expect(context.succeed).to.have.been.callCount(1);
        expect(context.fail).to.have.been.callCount(0);

        const result = await db.rows("SELECT * from consumption");
        expect(result.length).to.be.equal(0);
    });

    it("Save ANZ01 consumptionEvent e2e", async () => {
        const consumptionEvent = {
            id: "eventId",
            data: {
                element: {
                    sensorId: "ANZ01",
                    date: new Date(),
                    measurements: [{
                        source: "reading",
                        type: "activeEnergy",
                        value: 10,
                        unitOfMeasurement: "kWh"
                    }, {
                        source: "reading",
                        type: "reactiveEnergy",
                        value: 15,
                        unitOfMeasurement: "kVArh"
                    }, {
                        source: "reading",
                        type: "maxPower",
                        value: 800,
                        unitOfMeasurement: "kW"
                    }]
                },
                id: "consumption-01"
            },
            type: "element inserted in collection readings"
        };
        await handler(getEventFromObject(consumptionEvent), context);

        expect(context.succeed).to.have.been.callCount(1);
        expect(context.fail).to.have.been.callCount(0);

        const result = await db.row("SELECT * from consumption");
        const sequence = await db.row("SELECT last_value FROM consumption_id_seq");
        const meter = await db.row(
            "SELECT id FROM meter WHERE meter_code = $1",
            consumptionEvent.data.element.sensorId
        );

        expect(result).to.be.deep.equal({
            id: parseInt(sequence.last_value),
            meter_id: meter.id,
            date: new Date(),
            time: "00:00:00",
            active_energy: "10.0000",
            reactive_energy: "15.0000",
            max_power: "800.0000"
        });
    });

    it("Update ANZ01 consumptionEvent e2e", async () => {

        const consumptionEvent = {
            id: "eventId",
            data: {
                element: {
                    sensorId: "ANZ01",
                    source: "reading",
                    date: new Date(),
                    measurements: [{
                        type: "activeEnergy",
                        value: 12,
                        unitOfMeasurement: "kWh"
                    }, {
                        type: "reactiveEnergy",
                        value: 18,
                        unitOfMeasurement: "kVArh"
                    }, {
                        type: "maxPower",
                        value: 801,
                        unitOfMeasurement: "kW"
                    }]
                },
                id: "consumption-01"
            },
            type: "element inserted in collection readings"
        };

        const meter = await db.row(
            "SELECT id FROM meter WHERE meter_code = $1",
            consumptionEvent.data.element.sensorId
        );

        await db.query(
            "INSERT INTO consumption (meter_id, date, time, active_energy, reactive_energy, max_power) VALUES ($1, $2, $3, $4, $5, $6)",
            meter.id,
            new Date(),
            "00:00:00",
            199,
            199,
            199
        );

        await handler(getEventFromObject(consumptionEvent), context);

        expect(context.succeed).to.have.been.callCount(1);
        expect(context.fail).to.have.been.callCount(0);

        const result = await db.row("SELECT * from consumption");
        const sequence = await db.row("SELECT last_value FROM consumption_id_seq");

        expect(result).to.be.deep.equal({
            id: parseInt(sequence.last_value),
            meter_id: meter.id,
            date: new Date(),
            time: "00:00:00",
            active_energy: "12.0000",
            reactive_energy: "18.0000",
            max_power: "801.0000"
        });
    });

    it("Update ANZ01 consumptionEvent e2e", async () => {
        const consumptionEvent = {
            id: "eventId",
            data: {
                element: {
                    sensorId: "ANZ01",
                    date: new Date(),
                    measurements: [{
                        source: "reading",
                        type: "activeEnergy",
                        value: 19,
                        unitOfMeasurement: "kWh"
                    }, {
                        source: "reading",
                        type: "maxPower",
                        value: 805,
                        unitOfMeasurement: "kW"
                    }]
                },
                id: "consumption-01"
            },
            type: "element inserted in collection readings"
        };

        const meter = await db.row(
            "SELECT id FROM meter WHERE meter_code = $1",
            consumptionEvent.data.element.sensorId
        );

        await db.query(
            "INSERT INTO consumption (meter_id, date, time, active_energy, reactive_energy, max_power) VALUES ($1, $2, $3, $4, $5, $6)",
            meter.id,
            new Date(),
            "00:00:00",
            199,
            199,
            199
        );

        await handler(getEventFromObject(consumptionEvent), context);

        expect(context.succeed).to.have.been.callCount(1);
        expect(context.fail).to.have.been.callCount(0);

        const result = await db.row("SELECT * from consumption");
        const sequence = await db.row("SELECT last_value FROM consumption_id_seq");

        expect(result).to.be.deep.equal({
            id: parseInt(sequence.last_value),
            meter_id: meter.id,
            date: new Date(),
            time: "00:00:00",
            active_energy: "19.0000",
            reactive_energy: "199.0000",
            max_power: "805.0000"
        });
    });

});
