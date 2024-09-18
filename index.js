import { MittwaldAPIV2Client } from "@mittwald/api-client";
import * as flags from "flags";

const token = flags.defineString("api-token")
const ip = flags.defineString("ip")
const dns = flags.defineStringList("dns-zones")

flags.parse()

console.log(process.argv)

if (!(token.isSet && ip.isSet && dns.isSet)) process.exit(1)

console.log(token.get() + " " + ip.currentValue + " " + dns.currentValue)

const client = MittwaldAPIV2Client.newWithToken(token.currentValue) 

for (const zone of dns.currentValue) {
client.domain.dnsUpdateRecordSet({
    dnsZoneId: zone,
    recordSet: "a",
    data: {
        a: [ip.currentValue],
        aaaa: [],
        settings:{
            ttl:{
                auto:true
            }
        }
    }
}).then(res => {
    console.log(res.status)
    console.log(res.statusText)
})
}
