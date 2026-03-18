Component({
  properties: {
    taskId: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '',
    },
    subtitle: {
      type: String,
      value: '',
    },
    isCompleted: {
      type: Boolean,
      value: false,
    },
  },

  methods: {
    onToggleTask() {
      this.triggerEvent('toggletask', {
        taskId: this.properties.taskId,
        isCompleted: !this.properties.isCompleted,
      });
    },

    onOpenTask() {
      this.triggerEvent('opentask', {
        taskId: this.properties.taskId,
      });
    },
  },
});
