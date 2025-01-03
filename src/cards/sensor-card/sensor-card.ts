import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, nothing, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  actionHandler,
  ActionHandlerEvent,
  computeRTL,
  handleAction,
  hasAction,
  HomeAssistant,
  isActive,
  LovelaceCard,
  LovelaceCardEditor,
  SensorEntity,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { computeEntityPicture } from "../../utils/info";
import { SENSOR_CARD_EDITOR_NAME, SENSOR_CARD_NAME } from "./const";
import "./controls/sensor-value-control";
import { SensorCardConfig } from "./sensorcard-config";

registerCustomCard({
  type: SENSOR_CARD_NAME,
  name: "Mushroom Sensor Card",
  description: "Card for all sensors",
});

@customElement(SENSOR_CARD_NAME)
export class EntityCard
  extends MushroomBaseCard<SensorCardConfig, SensorEntity>
  implements LovelaceCard
{
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./sensor-card-editor");
    return document.createElement(
      SENSOR_CARD_EDITOR_NAME
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<SensorCardConfig> {
    const entities = Object.keys(hass.states);
    return {
      type: `custom:${SENSOR_CARD_NAME}`,
      entity: entities[0],
    };
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }

  protected get _secondObj(): SensorEntity | undefined {
    if (!this._config || !this.hass || !this._config.entity || !this._config.second_Value) return undefined;

    const entityId = this._config.second_Value;
    return this.hass.states[entityId] as SensorEntity;
  }


  protected render() {
    if (!this._config || !this.hass || !this._config.entity) {
      return nothing;
    }

    const stateObj = this._stateObj;
    const secondObj =  this._secondObj;

    

    if (!stateObj) {
      return this.renderNotFound(this._config);
    }

    const name = this._config.name || stateObj.attributes.friendly_name || "";
    const icon = this._config.icon;
    const appearance = computeAppearance(this._config);

    const picture = computeEntityPicture(stateObj, appearance.icon_type);

    const rtl = computeRTL(this.hass);

    return html`
      <ha-card
        class=${classMap({ "fill-container": appearance.fill_container })}
      >
        <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
          <mushroom-state-item
            ?rtl=${rtl}
            .appearance=${appearance}
            @action=${this._handleAction}
            .actionHandler=${actionHandler({
              hasHold: hasAction(this._config.hold_action),
              hasDoubleClick: hasAction(this._config.double_tap_action),
            })}
          >
            ${picture
              ? this.renderPicture(picture)
              : this.renderIcon(stateObj, icon)}
            ${this.renderBadge(stateObj)}
            ${this.renderStateInfo(stateObj, appearance, name)};
          </mushroom-state-item>
           <div class="actions" ?rtl=${rtl}>
            <mushroom-sensor-value-control
              .hass=${this.hass}
              .entity=${stateObj}
              .fill=${appearance.layout !== "horizontal"}
            >
            </mushroom-sensor-value-control>
          </div>
          ${secondObj ? html`
          <div class="actions" ?rtl=${rtl}>
            <mushroom-sensor-value-control
              .hass=${this.hass}
              .entity=${secondObj}
              .fill=${appearance.layout !== "horizontal"}
            >
            </mushroom-sensor-value-control>
          </div>
          `
          :nothing}
        </mushroom-card>
      </ha-card>
    `;
  }

  renderIcon(stateObj: HassEntity, icon?: string): TemplateResult {
    const active = isActive(stateObj);
    const iconStyle = {};
    const iconColor = this._config?.icon_color;
    if (iconColor) {
      const iconRgbColor = computeRgbColor(iconColor);
      iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
      iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
    }
    return html`
      <mushroom-shape-icon
        slot="icon"
        .disabled=${!active}
        style=${styleMap(iconStyle)}
      >
        <ha-state-icon
          .hass=${this.hass}
          .stateObj=${stateObj}
          .icon=${icon}
        ></ha-state-icon>
      </mushroom-shape-icon>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cardStyle,
      css`
        mushroom-state-item {
          cursor: pointer;
        }
        mushroom-shape-icon {
          --icon-color: rgb(var(--rgb-state-entity));
          --shape-color: rgba(var(--rgb-state-entity), 0.2);
        }
        mushroom-sensor-value-control {
          flex: 1;
          min-width: 64px;
        }
      `,
    ];
  }
}
