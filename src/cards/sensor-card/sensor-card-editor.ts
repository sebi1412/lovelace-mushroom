import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { LocalizeFunc, LovelaceCardEditor, fireEvent } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { computeAppearanceFormSchema } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { computeNameSchema } from "../../utils/form/name-schema";
import { loadHaComponents } from "../../utils/loader";
import { SENSOR_CARD_EDITOR_NAME, SENSOR_ENTITY_DOMAINS } from "./const";
import { SensorCardConfig, sensorCardConfigStruct } from "./sensor-card-config";

const computeSchema = memoizeOne(
  (
    localize: LocalizeFunc,
    customLocalize: LocalizeFunc,
    version: string
  ): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: SENSOR_ENTITY_DOMAINS } } },
    { name: "second_Value", selector: { entity: { domain: SENSOR_ENTITY_DOMAINS } } },
    { name: "last_seen", selector: { entity: {} } },
    computeNameSchema(version),
    {
      type: "grid",
      name: "",
      schema: [
        {
          name: "icon",
          selector: { icon: {} },
          context: { icon_entity: "entity" },
        },
        { name: "icon_color", selector: { ui_color: {} } },
      ],
    },
    ...computeAppearanceFormSchema(customLocalize),
    ...computeActionsFormSchema(),
  ]
);

@customElement(SENSOR_CARD_EDITOR_NAME)
export class EntityCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: SensorCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: SensorCardConfig): void {
    assert(config, sensorCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const customLocalize = setupCustomlocalize(this.hass);
    const schema = computeSchema(
      this.hass!.localize,
      customLocalize,
      this.hass!.config.version
    );

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }
}