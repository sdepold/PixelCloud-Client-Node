var util = require('util')
  , crypto  = require('crypto')

var hashToParams = function(h) {
  var result = []
  for(var key in h) {
    if(h[key]) result.push([key, h[key]].join("="))
  }
  return result.join("&")
}

var PixelCloud = function(accountName, apiKey, mode) {
  this.accountName  = accountName
  this.apiKey       = apiKey
  this.mode         = mode || 'development'
}

PixelCloud.prototype.getImageModificationUrl = function(method, src, options) {
  if(['resize', 'crop'].indexOf(method) == -1) {
    throw new Error('Invalid modification method: ' + util.inspect(method))
  } else {
    options = options || {}
    
    var requestUrl = 'http://pixelcloud.duostack.net/' + method + '/' + encodeURIComponent(src) + '?'
    requestUrl += hashToParams({ account: this.accountName, width: options.width, height: options.height })
    if(this.mode != 'development')
      requestUrl += "&" + hashToParams({ hash: crypto.createHash('md5').update(requestUrl + this.apiKey).digest('hex') })
    
    return requestUrl
  }
}

PixelCloud.prototype.getResizeImageUrl = function(src, options) {
  return this.getImageModificationUrl('resize', src, options)
}

PixelCloud.prototype.getCropImageUrl = function(src, options) {
  return this.getImageModificationUrl('crop', src, options)
}

PixelCloud.prototype.imageTag = function(method, src, options) {
  options = options || {}
  return '<img src="' + this.getImageModificationUrl(method, src, options) + '" alt="' + (options.alt || 'Resized image powered by PixelCloud') + '" />'
}

PixelCloud.prototype.resizeImageTag = function(src, options) {
  return this.imageTag('resize', src, options)
}

PixelCloud.prototype.cropImageTag = function(src, options) {
  return this.imageTag('crop', src, options)
}

PixelCloud.prototype.__defineGetter__('ViewHelpers', function() {
  return (function(self) {
    return {
      getResizeImageUrl: function(src, options) { return self.getResizeImageUrl.call(self, src, options) },
      getCropImageUrl: function(src, options) { return self.getCropImageUrl.call(self, src, options) },
      resizeImageTag: function(src, options) { return self.resizeImageTag.call(self, src, options) },
      cropImageTag: function(src, options) { return self.cropImageTag.call(self, src, options) }
    }
  })(this)
})

module.exports = PixelCloud