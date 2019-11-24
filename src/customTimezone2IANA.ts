import moment from 'moment-timezone';
import { Moment, MomentZone } from 'moment-timezone/moment-timezone';
import { CustomTimeZone } from '@microsoft/microsoft-graph-types';

/**
 * Maps Customized timezone to IANA timezone that is similar (has the same DST rules)
 *
 * https://docs.microsoft.com/en-us/graph/api/resources/customtimezone?view=graph-rest-1.0
 *
 * @param ctz - Microsoft customTimeZone
 * @param referenceInTime - epoch time in millis to which this calculation is referenced, default is now
 * @return name of IANA timezone or null if no suitable timezone found.
 */
export default function customTimezone2IANA(ctz: CustomTimeZone, referenceInTime: number = Date.now()): string | null {

    const timezone = moment.tz.names()
        .map(it => moment.tz.zone(it))
        .filter(it => it !== null)
        .find(tz => isTimezoneCompatible(tz as MomentZone, ctz, referenceInTime));

    return timezone ? timezone.name : null;
}

/**
 * @param tz - timezone
 * @param ctz - Microsoft customTimeZone
 * @param referenceInTime - epoch time in millis to which this calculation is referenced, default is now
 * @return true if tz has the same rules as ctz (current implementation does not take into account standardOffset.year and daylightOffset.year)
 */
function isTimezoneCompatible(tz: MomentZone, ctz: CustomTimeZone, referenceInTime: number = Date.now()): boolean {

    const now = referenceInTime;
    const currentUntilIdx = tz.untils.findIndex(ts => ts > now);

    const ctzObservesDST = ctz.daylightOffset && ctz.daylightOffset.daylightBias !== 0;
    const tzObservesDST = tz.untils[currentUntilIdx] !== Infinity;
    if (!ctzObservesDST) {
        return !tzObservesDST && tz.offsets[currentUntilIdx] === ctz.bias;
    }

    if (!tzObservesDST || tz.untils.length < 3) {
        // We need data for 2 transitions at least - to DST and back from DST to analyze the tz.
        return false;
    }

    // Shift current index to the future when there is no previous
    const currIdx = currentUntilIdx === 0 ? 1 : currentUntilIdx;
    const prevIdx = currIdx - 1;
    const nextIdx = currIdx + 1;

    return isTimeChangeCompatible(prevIdx, currIdx, tz, ctz)
        && isTimeChangeCompatible(currIdx, nextIdx, tz, ctz);
}

/**
 *
 * @param beforeIdx - index in MomentZone arrays representing period before the change from/to DST.
 * @param afterIdx - index in MomentZone arrays representing period after the change from/to DST
 * @param tz
 * @param ctz
 * @return true if tz has the same rules as ctz for this transition
 */
function isTimeChangeCompatible(beforeIdx: number, afterIdx: number, tz: MomentZone, ctz: CustomTimeZone): boolean {

    if (!ctz.bias || !ctz.standardOffset || !ctz.daylightOffset || !ctz.daylightOffset.daylightBias) return false;

    const change = moment(tz.untils[beforeIdx]);
    change.utcOffset(-tz.offsets[beforeIdx]);

    const offset = tz.offsets[beforeIdx];
    const offsetDiff = -(tz.offsets[afterIdx] - tz.offsets[beforeIdx]);
    const time = change.format('hh:mm:ss.SSSSSSS');
    const [nth, last] = getNthWeekdayInMonth(change);
    const dayOfWeek = moment.weekdays(change.isoWeekday()).toLowerCase();
    const month = change.month() + 1;

    if (offsetDiff > 0) {
        // Standard -> DST
        const dayOccurence = (ctz.daylightOffset.dayOccurrence === 5 && nth === 4 && last) ? 5 : nth;
        return offset === ctz.bias
            && offsetDiff === -ctz.daylightOffset.daylightBias
            && time === ctz.daylightOffset.time
            && dayOccurence === ctz.daylightOffset.dayOccurrence
            && dayOfWeek === ctz.daylightOffset.dayOfWeek
            && month === ctz.daylightOffset.month;
    } else {
        // DST -> Standard
        const dayOccurence = (ctz.standardOffset.dayOccurrence === 5 && nth === 4 && last) ? 5 : nth;
        return offset === ctz.bias + ctz.daylightOffset.daylightBias
            && offsetDiff === ctz.daylightOffset.daylightBias
            && time === ctz.standardOffset.time
            && dayOccurence === ctz.standardOffset.dayOccurrence
            && dayOfWeek === ctz.standardOffset.dayOfWeek
            && month === ctz.standardOffset.month;
    }
}

/**
 *
 * @param moment
 * @return [nth, last] tuple - nth ( occurrence of week day in that month e.g. value of 4 means 4th thursday (if moment is on thursday), last means whether it is the last occurrence in month
 */
function getNthWeekdayInMonth(moment: Moment): [number, boolean] {

    let occurrences = 0;

    const cursor = moment.clone().startOf('month');
    while (cursor.isSameOrBefore(moment)) {
        if (cursor.isoWeekday() === moment.isoWeekday()) {
            occurrences++;
            cursor.add(1, 'week');
        } else if (cursor.isoWeekday() < moment.isoWeekday()) {
            cursor.isoWeekday(moment.isoWeekday());
        } else {
            cursor.add(7 - (cursor.isoWeekday() - moment.isoWeekday()), 'days');
        }
    }
    const last = !cursor.isSameOrBefore(moment.clone().endOf('month'));

    return [occurrences, last];
}
