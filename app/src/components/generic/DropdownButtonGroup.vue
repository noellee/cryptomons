<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import _ from 'lodash';
import IconButton from '@/components/generic/IconButton.vue';

@Component
export default class DropdownButtonGroup extends Vue {
  @Prop(String) dropdownText!: string;

  public isOpened: boolean = false;

  render() {
    const h = this.$createElement;
    const buttons = this.$slots.default || [];
    return h('div', { class: 'dropdown-button-group' },
      _(buttons).filter(b => !b.isComment).size() === 1
        ? buttons
        : [
          this.renderMainButton(),
          h('div', { class: 'buttons' }, this.isOpened ? buttons : []),
        ]);
  }

  renderMainButton() {
    const h = this.$createElement;
    return h(
      IconButton,
      {
        on: { click: this.toggleDropdown },
        class: 'secondary',
        props: {
          icon: this.isOpened ? 'angle-up' : 'angle-down',
          position: 'right',
        },
      },
      this.dropdownText,
    );
  }

  toggleDropdown() {
    this.isOpened = !this.isOpened;
  }

  closeDropdown() {
    this.isOpened = false;
  }
}
</script>

<style>
.dropdown-button-group {
  position: relative;
  margin-top: 4px;
  width: 100%;
}

.dropdown-button-group > button {
  margin-top: 4px;
  width: 100%;
}

.dropdown-button-group .buttons {
  position: absolute;
  width: 100%;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
}

.dropdown-button-group .buttons button {
  flex-grow: 1;
}

.dropdown-button-group .buttons button:not(:first-child):not(:last-child) {
  border-radius: 0;
}
.dropdown-button-group .buttons button:first-child {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.dropdown-button-group .buttons button:last-child {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
