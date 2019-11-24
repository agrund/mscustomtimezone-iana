# MS Graph API customTimeZone to IANA converter
A tool to convert Microsoft [customTimeZone](https://docs.microsoft.com/en-us/graph/api/resources/customtimezone) to IANA time zone with same UTC offset and similar DST rules.

Can be used as a fallback for cases where MS Graph API returns customTimeZone despite user having standard time zone set in O365.

## Installation
`npm i mscustomtimezone-iana`

## Usage
```
import { CustomTimeZone } from '@microsoft/microsoft-graph-types';
import { customTimeZone2IANA } from "mscustometimezone-iana";

const customTimeZone = {
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

customTimeZone2IANA(customTimeZone); // -> 'America/Dawson'
```
