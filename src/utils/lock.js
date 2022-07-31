import { sleep } from './util'
export default class lock {
  timeout=5000
  status = false;
  TryLock () {
    if (this.status) {
    sleep(500)
    }
    return !this.status
  }

  Lock () {
    console.log('lock', this.timeout)
    if (!this.status) {
     const _this = this
      const to = new Promise(function (resolve) {
        sleep(_this.timeout)
    })
      to.then(() => {
        console.debug('timeout')
        this.status = false
      })
    }
    if (this.status) {
      sleep(300)
      if (this.status) {
      this.Lock()
      }
    }
   }
  UnLock () {
  this.status = false
  }
}
