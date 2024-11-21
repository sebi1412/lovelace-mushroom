import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  TemplateResult,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import {
  formatNumber,
  FrontendLocaleData,
} from "../ha";
import { string } from "superstruct";



@customElement("mushroom-output-number")
export class InputNumber extends LitElement {
  @property({ attribute: false }) public locale!: FrontendLocaleData;

  @property({ type: Boolean }) public disabled: boolean = false;

  @property({ attribute: false, type: Number, reflect: true })
  public value?: number;

  @property({ attribute: false, type: string, reflect: true })
  public unit?: string;

  @property({ attribute: "false" })
  public formatOptions: Intl.NumberFormatOptions = {};

  @state() pending = false;


  protected render(): TemplateResult {
    let value =
      this.value != null
        ? formatNumber(this.value, this.locale, this.formatOptions)
        : "-";

    value = value + (this.unit != null ? (" " + this.unit) : "")

    return html`
      <div class="container" id="container">
        <span
          class=${classMap({
            value: true,
            pending: this.pending,
            disabled: this.disabled,
          })}
        >
          ${value}
        </span>

      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --text-color: var(--primary-text-color);
        --text-color-disabled: rgb(var(--rgb-disabled));
        --icon-color: var(--primary-text-color);
        --icon-color-disabled: rgb(var(--rgb-disabled));
        --bg-color: rgba(var(--rgb-primary-text-color), 0.05);
        --bg-color-disabled: rgba(var(--rgb-disabled), 0.2);
        height: var(--control-height);
        width: calc(var(--control-height) * var(--control-button-ratio) * 3);
        flex: none;
      }
      .container {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 6px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        border-radius: var(--control-border-radius);
        border: none;
        background-color: var(--bg-color);
        transition: background-color 280ms ease-in-out;
        height: var(--control-height);
        overflow: hidden;
      }
      .button {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: var(--control-border-radius);
        line-height: 0;
        height: 100%;
      }
      .minus {
        padding-right: 0;
      }
      .plus {
        padding-left: 0;
      }
      .button:disabled {
        cursor: not-allowed;
      }
      .button ha-icon {
        font-size: var(--control-height);
        --mdc-icon-size: var(--control-icon-size);
        color: var(--icon-color);
        pointer-events: none;
      }
      .button:disabled ha-icon {
        color: var(--icon-color-disabled);
      }
      .value {
        text-align: center;
        flex-grow: 1;
        flex-shrink: 0;
        flex-basis: 20px;
        font-weight: bold;
        color: var(--text-color);
      }
      .value.disabled {
        color: var(--text-color-disabled);
      }
      .value.pending {
        opacity: 0.5;
      }
    `;
  }
}
