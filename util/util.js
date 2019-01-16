let getQueryString = function (url, name) {
  console.log("url = " + url)
  console.log("name = " + name)
  var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
  var r = url.match(reg)
  console.log("r = " + r)
  if (r != null) {
    console.log("r[2] = " + r[2])
    return r[2]
  }
  return null;
}
module.exports = {
  getQueryString: getQueryString,
}