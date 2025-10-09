import { MittwaldAPIV2Client } from "@mittwald/api-client";
import * as flags from "flags";
import { WebhookClient } from "discord.js";
import { resolve4 } from "dns/promises";

const token = flags.defineString("api-token") ?? ""
const ip = flags.defineString("ip")
const dns = flags.defineStringList("dns-zones")
const domainName = flags.defineStringList("domains")

flags.parse()

//console.log(process.argv)

if (!(token.isSet && ip.isSet && dns.isSet)) process.exit(1)

//console.log(token.get() + " " + ip.currentValue + " " + dns.currentValue)


const client = MittwaldAPIV2Client.newWithToken(token.currentValue)
const dc = new WebhookClient({ url: "https://discord.com/api/webhooks/1423980133974282311/tq2Z9mtSS-wQxD-vfot_Eh7sL1YyPOnA2VszYsPaf1IfjeAbDmRUVkQMshgfl32-SPlr" })

let zones = dns.currentValue ?? ""
let names = domainName.currentValue ?? []

if (zones.length == 0) {
    console.log("No Zones Provided")
    process.exit(1)
}
if (zones.length != names.length) {
    console.log("Zone and Domain name length mismatch")
    process.exit(1)
}

for (let i = 0; i < zones.length; i++) {
    console.log("Resolving " + names[i]);
    let shouldUpdate = true;

    const addr = await resolve4(names[i]);

    if (!addr || addr.length === 0) {
        console.log("found no address")
    }

    console.log("current IP: " + addr[i]);
    if (addr[i] === ip.currentValue) {
        shouldUpdate = true;
    }

    if (!shouldUpdate) {
        console.log("No need to update");
        continue;
    }
    console.log("Setting A record of " + names[i] + " to " + ip.currentValue)
    client.domain.dnsUpdateRecordSet({
        dnsZoneId: zones[i],
        recordSet: "a",
        data: {
            a: ip.currentValue,
            aaaa: [],
            settings: {
                ttl: {
                    auto: true
                }
            }
        }
    }).then(res => {
        console.log("Setting A Record returned " + res.status)
        console.log(res.statusText)

        if (res.status != 204) {
            dc.send("Failed to set dns record with code " + res.status + " for domain " + names[i])
        }
    })
}
