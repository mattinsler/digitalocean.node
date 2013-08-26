# heroku.node

[Digital Ocean API](https://api.digitalocean.com/) client for node.js

## Installation
```
npm install digitalocean.node
```

## Usage

```javascript
var DigitalOcean = require('digitalocean.node');

var client = new DigitalOcean({client_id: '...', api_key: '...'});

// Do something with client
```

## Constructors

#### new DigitalOcean({client_id: '...', api_key: '...'})

## Methods

### Higher Level

#### client.new_droplet(config, callback)

The DigitalOcean API asks you to supply the size_id, image_id, and region_id, but what if you just
don't know them and don't want to take the chance of hardcoding in case they're changed in the
future? This method will allow you to just use the names of each.

##### config

- `name`: Name you want to call the instance
- `size`: The name of the size you'd like. i.e. "512MB", "1GB", "2GB", etc.
- `image`: The name of the image you'd like. i.e. "Ubuntu 12.04 x64", "Docker on Ubuntu 13.04", etc.
- `region`: The name of the image you'd like. i.e. "San Francisco 1", "New York 2", etc.
- `ssh_key` or `ssh_keys`: The name or names of the ssh key or ssh keys that you would like to associate with this instance.

Example
```javascript
client.new_droplet({
  name: 'my-server'
  size: '1GB'
  image: 'Ubuntu 12.04 x64'
  region: 'San Francisco 1'
  ssh_key: 'awesomeness'
} , function(err, instance) {
  console.log(instance);
});

```

### Droplets

#### client.droplets.list(callback)
#### client.droplets.by_name(name, callback)
#### client.droplets.new(callback)

#### client.droplet(id).get(callback)
#### client.droplet(id).destroy(callback)

### Regions

#### client.regions.list(callback)

### Images

#### client.images.list(callback)

### SSH Keys

#### client.ssh_keys.list(callback)

### Sizes

#### client.sizes.list(callback)

### Domains

#### client.domains.list(callback)

## License
Copyright (c) 2013 Matt Insler  
Licensed under the MIT license.
