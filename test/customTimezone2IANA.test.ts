import { CustomTimeZone } from '@microsoft/microsoft-graph-types';
import customTimezone2IANA from '../src';

describe('customTimezone2IANA', () => {

    it('should convert custom time zone to America/Dawson.', () => {

        const ctzPacific = {
            bias: 480,
            name: 'Customized Time Zone',
            standardOffset: {
                time: '02:00:00.0000000',
                dayOccurrence: 1,
                dayOfWeek: 'sunday',
                month: 11,
                year: 0
            },
            daylightOffset: {
                daylightBias: -60,
                time: '02:00:00.0000000',
                dayOccurrence: 2,
                dayOfWeek: 'sunday',
                month: 3,
                year: 0
            }
        } as CustomTimeZone;

        const timezone = customTimezone2IANA(ctzPacific);

        expect(timezone).toEqual('America/Dawson');
    });

    it('should convert custom time zone to Africa/Ceuta.', () => {

        const ctzCET = {
            bias: -60,
            name: 'Customized Time Zone',
            standardOffset: {
                time: '03:00:00.0000000',
                dayOccurrence: 5,
                dayOfWeek: 'sunday',
                month: 10,
                year: 0
            },
            daylightOffset: {
                daylightBias: -60,
                time: '02:00:00.0000000',
                dayOccurrence: 5,
                dayOfWeek: 'sunday',
                month: 3,
                year: 0
            }
        } as CustomTimeZone;

        const timezone = customTimezone2IANA(ctzCET);

        expect(timezone).toEqual('Africa/Ceuta');
    });

    it('should return custom time zone name if suitable IANA not found.', () => {

        const ctzCET = {
            bias: -63,
            name: 'Customized Time Zone',
            standardOffset: {
                time: '03:00:00.0000000',
                dayOccurrence: 5,
                dayOfWeek: 'sunday',
                month: 10,
                year: 0
            },
            daylightOffset: {
                daylightBias: -61,
                time: '02:00:00.0000000',
                dayOccurrence: 5,
                dayOfWeek: 'sunday',
                month: 3,
                year: 0
            }
        } as CustomTimeZone;

        const timezone = customTimezone2IANA(ctzCET);

        expect(timezone).toBeNull();
    });
});
