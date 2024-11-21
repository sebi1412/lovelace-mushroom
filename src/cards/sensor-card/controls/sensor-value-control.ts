import { html, LitElement, nothing ,TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  computeRTL,
  HomeAssistant,
  isAvailable,
  SensorEntity
} from "../../../ha";
import "../../../shared/button";
import "../../../shared/button-group";
import "../../../shared/output-number";
import "../../../shared/input-number";

import setupCustomlocalize from "../../../localize";
//import { isActionPending, isLocked, isUnlocked } from "../utils";


@customElement("mushroom-sensor-value-control")
export class LockButtonsControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: SensorEntity;

  @property({ type: Boolean }) public fill: boolean = false;

  onValueChange(e: CustomEvent<{ value: number }>): void {
    const value = e.detail.value;
    this.hass!.callService("climate", "set_temperature", {
      entity_id: this.entity.entity_id,
      temperature: value,
    });
  }

  protected render(): TemplateResult {
    const rtl = computeRTL(this.hass);
    const available = isAvailable(this.entity);

    const formatOptions: Intl.NumberFormatOptions =
        false
        ? {
            maximumFractionDigits: 0,
            }
        : {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
            };

    const customLocalize = setupCustomlocalize(this.hass!);

    return html`
     <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
        <mushroom-output-number
            .locale=${this.hass.locale}
            .value=${this.entity.state}
            .unit=${this.entity.attributes.unit_of_measurement}
            .disabled=${false}
            .formatOptions=${formatOptions}
            @change=${this.onValueChange}
        ></mushroom-output-number>
     </mushroom-button-group>
    `;
  }
}
