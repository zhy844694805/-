Component({
  properties: {
    selectedDateLabel: {
      type: String,
      value: '',
    },
    tasks: {
      type: Array,
      value: [],
    },
  },

  methods: {
    onToggleTask(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent('toggletask', event.detail);
    },

    onOpenTask(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent('opentask', event.detail);
    },
  },
});
