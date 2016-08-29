import {insertConsumption} from "steps/save-db";
import log from "services/logger";
import {path} from "ramda";
export default async function pipeline(event) {
    log.info(event);
    const rawReading = event.data.element;
    const source = (
        rawReading.source ?
        rawReading.source :
        path(["measurements", "0", "source"], rawReading)
    );
    /*
     *   Workaround: some events have been incorrectly generated and thus don't
     *   have an `element` property. When processing said events, just return and
     *   move on without failing, as failures can block the kinesis stream.
     */
    if (!rawReading ||
        !rawReading.sensorId ||
        !(source === "reading") ||
        !rawReading.measurements ||
        !rawReading.measurements.find(x => x.type === "activeEnergy") &&
        !rawReading.measurements.find(x => x.type === "maxPower") &&
        !rawReading.measurements.find(x => x.type === "reactiveEnergy")
    ) {
        return null;
    }

    await insertConsumption(rawReading);
}
