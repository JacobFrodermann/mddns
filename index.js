import { MittwaldAPIV2Client } from "@mittwald/api-client";
import * as flags from "flags";
import { WebhookClient } from "discord.js";

const token = flags.defineString("api-token")
const ip = flags.defineString("ip")
const dns = flags.defineStringList("dns-zones")
const domainName = flags.defineStringList("domains")

flags.parse()

//console.log(process.argv)

if (!(token.isSet && ip.isSet && dns.isSet)) process.exit(1)

//console.log(token.get() + " " + ip.currentValue + " " + dns.currentValue)

const client = MittwaldAPIV2Client.newWithToken(token.currentValue) 
const dc = new WebhookClient({url: "https://discord.com/api/webhooks/1423980133974282311/tq2Z9mtSS-wQxD-vfot_Eh7sL1YyPOnA2VszYsPaf1IfjeAbDmRUVkQMshgfl32-SPlr"})

let zones = dns.currentValue
let names = domainName.currentValue

for (let i = 0; i < zones; i++) {
    console.log("Setting A record of " + names[i] + " to " + ip.currentValue)
    client.domain.dnsUpdateRecordSet({
        dnsZoneId: zones[i],
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
        console.log("Setting A Record returned " + res.status)
        console.log(res.statusText)

        if (res.status != 204) {
            dc.send("Failed to set dns record with code " + res.status + " for domain " + names[i])
        }
    })
}
