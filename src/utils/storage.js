export default class Store {
  // expire second
  static set (key, val, expire) {
    const data = JSON.stringify({ val: val, expire: new Date().getTime() + expire * 1000 })
    window.localStorage.setItem(key, data)
  }
 static get (key) {
   const dataStr = window.localStorage.getItem(key)
   if (!dataStr) {
     return false
   }
  const data = JSON.parse(dataStr)
   if (data.expire >= new Date().getTime()) {
     return data.val
   } else {
     this.remove(key)
    return false
    }
 }
  static remove (key) {
    window.localStorage.removeItem(key)
  }
}
