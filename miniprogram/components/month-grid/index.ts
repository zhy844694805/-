Component({
  properties: {
    cells: {
      type: Array,
      value: [],
    },
  },

  methods: {
    onSelectDay(event: WechatMiniprogram.BaseEvent) {
      this.triggerEvent('selectday', {
        dueDateKey: event.currentTarget.dataset.dueDateKey,
      });
    },
  },
});
