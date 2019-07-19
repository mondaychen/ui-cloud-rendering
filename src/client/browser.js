
const Browser = {
  all(node, query, callback){
    node.querySelectorAll(query).forEach(callback)
  },

  canPushState(){ return (typeof(history.pushState) !== "undefined") },

  // fetchPage(href, callback){
  //   let req = new XMLHttpRequest()
  //   req.open("GET", href, true)
  //   req.timeout = PUSH_TIMEOUT
  //   req.setRequestHeader("content-type", "text/html")
  //   req.setRequestHeader("cache-control", "max-age=0, no-cache, must-revalidate, post-check=0, pre-check=0")
  //   req.setRequestHeader(LINK_HEADER, "live-link")
  //   req.onerror = () => callback(400)
  //   req.ontimeout = () => callback(504)
  //   req.onreadystatechange = () => {
  //     if(req.readyState !== 4){ return }
  //     if(req.getResponseHeader(LINK_HEADER) !== "live-link"){ return callback(400) }
  //     if(req.status !== 200){ return callback(req.status) }
  //     callback(200, req.responseText)
  //   }
  //   req.send()
  // },

  pushState(kind, meta, to, callback){
    if(this.canPushState()){
      if(to !== window.location.href){ history[kind + "State"](meta, "", to) }
      callback && callback()
    } else {
      this.redirect(to)
    }
  },

  dispatchEvent(target, eventString){
    let event = null
    if(typeof(Event) === "function"){
      event = new Event(eventString)
    } else {
      event = document.createEvent("Event")
      event.initEvent(eventString, true, true)
    }
    target.dispatchEvent(event)
  },

  setCookie(name, value){
    document.cookie = `${name}=${value}`
  },

  getCookie(name){
    return document.cookie.replace(new RegExp(`(?:(?:^|.*;\s*)${name}\s*\=\s*([^;]*).*$)|^.*$`), "$1")
  },

  redirect(toURL, flash){
    if(flash){ Browser.setCookie("__phoenix_flash__", flash + "; max-age=60000; path=/") }
    window.location = toURL
  }
}

export default Browser;