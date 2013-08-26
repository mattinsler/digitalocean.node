(function() {
  var Api, DigitalOcean, DomainsApi, DropletApi, DropletsApi, ImagesApi, RegionsApi, Rest, SizesApi, SshKeysApi, async, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore');

  async = require('async');

  Rest = require('rest.node');

  Api = {
    Droplet: DropletApi = (function() {

      function DropletApi(client, droplet) {
        this.client = client;
        this.droplet = droplet;
      }

      DropletApi.prototype.get = function(cb) {
        return this.client.get("/droplets/" + this.droplet, cb);
      };

      DropletApi.prototype.destroy = function(cb) {
        return this.client.get("/droplets/" + this.droplet + "/destroy", cb);
      };

      return DropletApi;

    })(),
    Droplets: DropletsApi = (function() {

      function DropletsApi(client) {
        this.client = client;
      }

      DropletsApi.prototype.list = function(cb) {
        return this.client.get('/droplets', cb);
      };

      DropletsApi.prototype.by_name = function(name, cb) {
        return this.list(function(err, list) {
          if (err != null) {
            return cb(err);
          }
          return cb(null, _(list).where({
            name: name
          }));
        });
      };

      DropletsApi.prototype["new"] = function(opts, cb) {
        return this.client.get('/droplets/new', opts, cb);
      };

      return DropletsApi;

    })(),
    Regions: RegionsApi = (function() {

      function RegionsApi(client) {
        this.client = client;
      }

      RegionsApi.prototype.list = function(cb) {
        return this.client.get('/regions', cb);
      };

      return RegionsApi;

    })(),
    Images: ImagesApi = (function() {

      function ImagesApi(client) {
        this.client = client;
      }

      ImagesApi.prototype.list = function(cb) {
        return this.client.get('/images', cb);
      };

      return ImagesApi;

    })(),
    SshKeys: SshKeysApi = (function() {

      function SshKeysApi(client) {
        this.client = client;
      }

      SshKeysApi.prototype.list = function(cb) {
        return this.client.get('/ssh_keys', cb);
      };

      return SshKeysApi;

    })(),
    Sizes: SizesApi = (function() {

      function SizesApi(client) {
        this.client = client;
      }

      SizesApi.prototype.list = function(cb) {
        return this.client.get('/sizes', cb);
      };

      return SizesApi;

    })(),
    Domains: DomainsApi = (function() {

      function DomainsApi(client) {
        this.client = client;
      }

      DomainsApi.prototype.list = function(cb) {
        return this.client.get('/domains', cb);
      };

      return DomainsApi;

    })()
  };

  DigitalOcean = (function(_super) {

    __extends(DigitalOcean, _super);

    DigitalOcean.hooks = {
      json: function(request_opts, opts) {
        var _ref;
        if ((_ref = request_opts.headers) == null) {
          request_opts.headers = {};
        }
        return request_opts.headers.Accept = 'application/json';
      },
      auth: function(client_id, api_key) {
        return function(request_opts, opts) {
          var _ref;
          if ((_ref = request_opts.qs) == null) {
            request_opts.qs = {};
          }
          request_opts.qs.client_id = client_id;
          return request_opts.qs.api_key = api_key;
        };
      },
      querystring: function(request_opts, opts) {
        var k, v, _ref, _results;
        if ((_ref = request_opts.qs) == null) {
          request_opts.qs = {};
        }
        _results = [];
        for (k in opts) {
          v = opts[k];
          _results.push(request_opts.qs[k] = v);
        }
        return _results;
      }
    };

    function DigitalOcean(options) {
      this.options = options != null ? options : {};
      DigitalOcean.__super__.constructor.call(this, {
        base_url: 'https://api.digitalocean.com'
      });
      this.hook('pre:request', DigitalOcean.hooks.json);
      if ((this.options.client_id != null) && (this.options.api_key != null)) {
        this.hook('pre:request', DigitalOcean.hooks.auth(this.options.client_id, this.options.api_key));
      }
      this.hook('pre:get', DigitalOcean.hooks.querystring);
      this.droplets = new Api.Droplets(this);
      this.regions = new Api.Regions(this);
      this.images = new Api.Images(this);
      this.ssh_keys = new Api.SshKeys(this);
      this.sizes = new Api.Sizes(this);
      this.domains = new Api.Domains(this);
    }

    DigitalOcean.prototype.parse_response_body = function(headers, body) {
      if (typeof body !== 'string') {
        return body;
      }
      body = JSON.parse(body);
      delete body.status;
      return body[Object.keys(body)[0]];
    };

    DigitalOcean.prototype.droplet = function(id) {
      return new Api.Droplet(this, id);
    };

    DigitalOcean.prototype.new_droplet = function(opts, callback) {
      var _this = this;
      if (!((opts.name != null) && (opts.size != null) && (opts.image != null) && (opts.region != null))) {
        return callback(new Error("new_droplet requires name, size, image, region"));
      }
      return async.parallel({
        sizes: function(cb) {
          return _this.sizes.list(cb);
        },
        images: function(cb) {
          return _this.images.list(cb);
        },
        regions: function(cb) {
          return _this.regions.list(cb);
        },
        ssh_keys: function(cb) {
          return _this.ssh_keys.list(cb);
        }
      }, function(err, data) {
        var image, new_opts, region, size, ssh_keys;
        size = _(data.sizes).findWhere({
          name: opts.size
        });
        image = _(data.images).findWhere({
          name: opts.image
        });
        region = _(data.regions).findWhere({
          name: opts.region
        });
        if (opts.ssh_key != null) {
          opts.ssh_keys = [opts.ssh_key];
        }
        if (opts.ssh_keys != null) {
          if (!Array.isArray(opts.ssh_keys)) {
            opts.ssh_keys = [opts.ssh_keys];
          }
          ssh_keys = data.ssh_keys.filter(function(k) {
            var _ref;
            return _ref = k.name, __indexOf.call(opts.ssh_keys, _ref) >= 0;
          });
        }
        if (size == null) {
          return callback(new Error("Could not find size " + opts.size));
        }
        if (image == null) {
          return callback(new Error("Could not find image " + opts.image));
        }
        if (region == null) {
          return callback(new Error("Could not find region " + opts.region));
        }
        if (!((opts.ssh_keys != null) && (ssh_keys != null))) {
          return callback(new Error("Could not find ssh keys " + opts.ssh_keys));
        }
        new_opts = {
          name: opts.name,
          size_id: size.id,
          image_id: image.id,
          region_id: region.id
        };
        if (ssh_keys != null) {
          new_opts.ssh_key_ids = _(ssh_keys).pluck('id').join(',');
        }
        return _this.droplets["new"](new_opts, callback);
      });
    };

    return DigitalOcean;

  })(Rest);

  module.exports = DigitalOcean;

}).call(this);
