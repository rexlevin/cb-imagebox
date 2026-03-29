import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModulesStore = defineStore('modules', () => {
  const currentModule = ref('dashboard')
  const recentFiles = ref([])

  function setModule(module) {
    currentModule.value = module
  }

  function addRecentFile(file) {
    const existing = recentFiles.value.findIndex(f => f.id === file.id)
    if (existing !== -1) {
      recentFiles.value.splice(existing, 1)
    }
    recentFiles.value.unshift({
      ...file,
      timestamp: Date.now()
    })
    if (recentFiles.value.length > 10) {
      recentFiles.value.pop()
    }
  }

  function clearRecentFiles() {
    recentFiles.value = []
  }

  return {
    currentModule,
    recentFiles,
    setModule,
    addRecentFile,
    clearRecentFiles
  }
})
