_ = require 'underscore'
async = require 'async'
Rest = require 'rest.node'

Api = {
  Droplet: class DropletApi
    constructor: (@client, @droplet) ->
    get: (cb) -> @client.get("/droplets/#{@droplet}", cb)
    destroy: (cb) -> @client.get("/droplets/#{@droplet}/destroy", cb)
  
  Droplets: class DropletsApi
    constructor: (@client) ->
    list: (cb) -> @client.get('/droplets', cb)
    by_name: (name, cb) -> @list (err, list) ->
      return cb(err) if err?
      cb(null, _(list).where(name: name))
    new: (opts, cb) -> @client.get('/droplets/new', opts, cb)
    
  Regions: class RegionsApi
    constructor: (@client) ->
    list: (cb) -> @client.get('/regions', cb)
  
  Images: class ImagesApi
    constructor: (@client) ->
    list: (cb) -> @client.get('/images', cb)
  
  SshKeys: class SshKeysApi
    constructor: (@client) ->
    list: (cb) -> @client.get('/ssh_keys', cb)
  
  Sizes: class SizesApi
    constructor: (@client) ->
    list: (cb) -> @client.get('/sizes', cb)
  
  Domains: class DomainsApi
    constructor: (@client) ->
    list: (cb) -> @client.get('/domains', cb)
}

class DigitalOcean extends Rest
  @hooks:
    json: (request_opts, opts) ->
      request_opts.headers ?= {}
      request_opts.headers.Accept = 'application/json'
    
    auth: (client_id, api_key) ->
      (request_opts, opts) ->
        request_opts.qs ?= {}
        request_opts.qs.client_id = client_id
        request_opts.qs.api_key = api_key
    
    querystring: (request_opts, opts) ->
      request_opts.qs ?= {}
      request_opts.qs[k] = v for k, v of opts
  
  constructor: (@options = {}) ->
    super(base_url: 'https://api.digitalocean.com')
    
    @hook('pre:request', DigitalOcean.hooks.json)
    @hook('pre:request', DigitalOcean.hooks.auth(@options.client_id, @options.api_key)) if @options.client_id? and @options.api_key?
    @hook('pre:get', DigitalOcean.hooks.querystring)
    
    @droplets = new Api.Droplets(@)
    @regions = new Api.Regions(@)
    @images = new Api.Images(@)
    @ssh_keys = new Api.SshKeys(@)
    @sizes = new Api.Sizes(@)
    @domains = new Api.Domains(@)
  
  parse_response_body: (headers, body) ->
    return body unless typeof body is 'string'
    body = JSON.parse(body)
    
    delete body.status
    body[Object.keys(body)[0]]
  
  droplet: (id) -> new Api.Droplet(@, id)
  
  new_droplet: (opts, callback) ->
    return callback(new Error("new_droplet requires name, size, image, region")) unless opts.name? and opts.size? and opts.image? and opts.region?
    
    async.parallel {
      sizes: (cb) => @sizes.list(cb)
      images: (cb) => @images.list(cb)
      regions: (cb) => @regions.list(cb)
      ssh_keys: (cb) => @ssh_keys.list(cb)
    }, (err, data) =>
      size = _(data.sizes).findWhere(name: opts.size)
      image = _(data.images).findWhere(name: opts.image)
      region = _(data.regions).findWhere(name: opts.region)
      
      opts.ssh_keys = [opts.ssh_key] if opts.ssh_key?
      if opts.ssh_keys?
        opts.ssh_keys = [opts.ssh_keys] unless Array.isArray(opts.ssh_keys)
        ssh_keys = data.ssh_keys.filter((k) -> k.name in opts.ssh_keys)
      
      return callback(new Error("Could not find size #{opts.size}")) unless size?
      return callback(new Error("Could not find image #{opts.image}")) unless image?
      return callback(new Error("Could not find region #{opts.region}")) unless region?
      return callback(new Error("Could not find ssh keys #{opts.ssh_keys}")) unless opts.ssh_keys? and ssh_keys?
      
      new_opts =
        name: opts.name
        size_id: size.id
        image_id: image.id
        region_id: region.id
      new_opts.ssh_key_ids = _(ssh_keys).pluck('id').join(',') if ssh_keys?
      
      @droplets.new(new_opts, callback)

module.exports = DigitalOcean
