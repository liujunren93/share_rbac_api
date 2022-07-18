const cache = {
  state: {
    formData: { '1': 1 }

  },
  getters: {
    getFormData: (state) => (key) => {
      return state.formData[key]
    }
  }
}
export default cache
