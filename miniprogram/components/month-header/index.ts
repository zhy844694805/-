Component({
  properties: {
    monthTitle: {
      type: String,
      value: '',
    },
    visibleScope: {
      type: String,
      value: 'all',
    },
  },

  methods: {
    onPrevMonth() {
      this.triggerEvent('prevmonth');
    },

    onNextMonth() {
      this.triggerEvent('nextmonth');
    },

    onGoToday() {
      this.triggerEvent('gotoday');
    },

    onScopeChange(event: WechatMiniprogram.BaseEvent) {
      this.triggerEvent('scopechange', {
        scope: event.currentTarget.dataset.scope,
      });
    },
  },
});
