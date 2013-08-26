_ = require 'underscore'
DigitalOcean = require '../lib/digitalocean'

client = new DigitalOcean(client_id: process.env.DO_CLIENT_ID, api_key: process.env.DO_API_KEY)

print = -> console.log arguments

client.regions.list(print)
client.domains.list(print)
