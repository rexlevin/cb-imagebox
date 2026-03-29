import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFilesStore = defineStore('files', () => {
  const files = ref([])
  const processing = ref(false)
  const progress = ref(0)

  function addFiles(newFiles) {
    files.value = [...files.value, ...newFiles]
  }

  function removeFile(id) {
    files.value = files.value.filter(f => f.id !== id)
  }

  function clearFiles() {
    files.value = []
  }

  function updateFileStatus(id, status, result = null) {
    const file = files.value.find(f => f.id === id)
    if (file) {
      file.status = status
      if (result) {
        file.result = result
      }
    }
  }

  function setProcessing(value) {
    processing.value = value
  }

  function setProgress(value) {
    progress.value = value
  }

  return {
    files,
    processing,
    progress,
    addFiles,
    removeFile,
    clearFiles,
    updateFileStatus,
    setProcessing,
    setProgress
  }
})
