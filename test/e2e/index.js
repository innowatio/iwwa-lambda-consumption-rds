import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import {getEventFromObject} from "../mocks";
import {handler} from "index";
import getDb from "services/db";

describe("Save weather events on RDS", () => {

    const context = {
        succeed: sinon.spy(),
        fail: sinon.spy()
    };

    const db = getDb();

    sinon.useFakeTimers();

    before(async () => {
        await db.query({
            text: "DELETE FROM meter"
        });
        await db.query(
            "INSERT INTO meter (meter_code) VALUES ($1)",
            "ANZ01"
        );
    });

    beforeEach(async () => {
        await db.query({
            text: "DELETE FROM consumption"
        });
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
                        type: "activeEnergy",
                        value: 10,
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
                    measurements: [{
                        type: "activeEnergy",
                        value: 10,
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

    it("Save ANZ01 consumptionEvent e2e", async () => {
        const weatherEvent = {
            id: "eventId",
            data: {
                element: {
                    sensorId: "ANZ01",
                    date: new Date(),
                    measurements: [{
                        type: "activeEnergy",
                        value: 10,
                        unitOfMeasurement: "%"
                    }, {
                        type: "reactiveEnergy",
                        value: 15,
                        unitOfMeasurement: "%"
                    }, {
                        type: "maxPower",
                        value: 800,
                        unitOfMeasurement: "id"
                    }]
                },
                id: "consumption-01"
            },
            type: "element inserted in collection readings"
        };
        await handler(getEventFromObject(weatherEvent), context);

        expect(context.succeed).to.have.been.callCount(1);
        expect(context.fail).to.have.been.callCount(0);

        const result = await db.rows("SELECT * from consumption");
        expect(result.length).to.be.equal(1);
    });

});