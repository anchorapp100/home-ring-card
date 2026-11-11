/* A made-up house for the demo page: three floors, twelve rooms, about sixty things.
   It behaves like Home Assistant's `hass` object closely enough for the card: taps switch lights,
   thermostats take new targets, scenes run, the alarm arms. Nothing here is a real home. */
(function () {
  const now = Date.now(), ago = m => new Date(now - m * 60000).toISOString();
  const floors = {
    ground: { floor_id: 'ground', name: 'Ground floor', level: 0 },
    first: { floor_id: 'first', name: 'First floor', level: 1 },
    outside: { floor_id: 'outside', name: 'Outside', level: null },
  };
  const A = (id, name, floor) => ({ area_id: id, name, floor_id: floor });
  const areas = Object.fromEntries([
    A('living_room', 'Living Room', 'ground'), A('kitchen', 'Kitchen', 'ground'), A('dining_room', 'Dining Room', 'ground'),
    A('hall', 'Hall', 'ground'), A('utility', 'Utility', 'ground'),
    A('main_bedroom', 'Main Bedroom', 'first'), A('kids_room', "Kids' Room", 'first'), A('office', 'Office', 'first'),
    A('bathroom', 'Bathroom', 'first'), A('landing', 'Landing', 'first'),
    A('garden', 'Garden', 'outside'), A('driveway', 'Driveway', 'outside'),
  ].map(a => [a.area_id, a]));

  const states = {}, entities = {};
  const add = (eid, area, state, attrs, mins) => {
    states[eid] = { entity_id: eid, state, attributes: attrs || {}, last_changed: ago(mins == null ? 40 : mins), last_updated: ago(mins == null ? 40 : mins) };
    entities[eid] = { entity_id: eid, area_id: area, device_id: null, hidden: false, entity_category: null, name: null };
  };
  const light = (eid, area, name, on, bri, kind) => add(eid, area, on ? 'on' : 'off', Object.assign({ friendly_name: name,
    supported_color_modes: kind === 'onoff' ? ['onoff'] : kind === 'rgb' ? ['color_temp', 'hs'] : ['brightness'],
    brightness: on && kind !== 'onoff' ? Math.round(bri * 2.55) : null, color_mode: on ? (kind === 'rgb' ? 'hs' : kind === 'onoff' ? 'onoff' : 'brightness') : null },
    kind === 'rgb' ? { min_color_temp_kelvin: 2200, max_color_temp_kelvin: 6500, color_temp_kelvin: null, hs_color: on ? [28, 80] : null, effect_list: ['None', 'Candle', 'Sunset', 'Aurora'], effect: on ? 'None' : null } : {}));
  const therm = (eid, area, name, cur, tgt, heating) => add(eid, area, 'heat', { friendly_name: name, current_temperature: cur, temperature: tgt,
    hvac_action: heating ? 'heating' : 'idle', hvac_modes: ['heat', 'off'], preset_modes: ['comfort', 'eco', 'away'], preset_mode: 'comfort',
    min_temp: 5, max_temp: 28, target_temp_step: 0.5, current_humidity: 48 });
  const bs = (eid, area, name, cls, on, mins) => add(eid, area, on ? 'on' : 'off', { friendly_name: name, device_class: cls }, mins);
  const sw = (eid, area, name, on) => add(eid, area, on ? 'on' : 'off', { friendly_name: name });
  const media = (eid, area, name, st, title, artist) => add(eid, area, st, { friendly_name: name, media_title: title, media_artist: artist, volume_level: 0.32, source: 'Radio', source_list: ['Radio', 'Spotify', 'TV'] });
  const cam = (eid, area, name, pic) => add(eid, area, 'idle', { friendly_name: name, entity_picture: pic });

  const svgUri = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const CAM_GARDEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27415f"/><stop offset="1" stop-color="#7d93a8"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><rect y="235" width="640" height="125" fill="#3e5a3a"/><path d="M0 235 Q160 200 320 228 T640 220 V240 H0Z" fill="#4c6b45"/><rect x="430" y="150" width="160" height="90" fill="#6b5442"/><path d="M420 150 L510 105 L600 150Z" fill="#53402f"/><rect x="60" y="225" width="300" height="10" fill="#8a7a64"/><g fill="#2f4a2c"><circle cx="110" cy="190" r="42"/><circle cx="160" cy="170" r="52"/><circle cx="215" cy="195" r="38"/></g><text x="16" y="28" font-family="monospace" font-size="16" fill="#fff" opacity=".8">GARDEN  CAM 2</text></svg>';
  const CAM_FRONT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#5f6f7f"/><rect y="250" width="640" height="110" fill="#4a4a4e"/><path d="M0 250 L640 250 L640 268 L0 268Z" fill="#6d6d72"/><rect x="250" y="90" width="140" height="160" fill="#2e3a48"/><rect x="262" y="104" width="116" height="146" fill="#7a3b2e"/><circle cx="362" cy="180" r="5" fill="#d8c27a"/><rect x="60" y="110" width="130" height="90" fill="#a9c3d6" opacity=".6"/><rect x="450" y="110" width="130" height="90" fill="#a9c3d6" opacity=".6"/><rect x="120" y="270" width="200" height="60" rx="10" fill="#2b2f36"/><text x="16" y="28" font-family="monospace" font-size="16" fill="#fff" opacity=".8">FRONT DOOR  CAM 1</text></svg>';
  // Ground floor
  light('light.living_room_ceiling', 'living_room', 'Living Room Ceiling', true, 70);
  light('light.living_room_floor_lamp', 'living_room', 'Living Room Floor Lamp', true, 45, 'rgb');
  light('light.living_room_shelf', 'living_room', 'Living Room Shelf Strip', false, 0, 'rgb');
  therm('climate.living_room', 'living_room', 'Living Room', 21.4, 21, false);
  media('media_player.living_room_tv', 'living_room', 'Living Room TV', 'playing', 'Evening News', 'Channel 4');
  bs('binary_sensor.living_room_motion', 'living_room', 'Living Room Motion', 'motion', true, 1);
  sw('switch.living_room_fire', 'living_room', 'Living Room Fire', false);
  add('cover.living_room_blind', 'living_room', 'open', { friendly_name: 'Living Room Blind', current_position: 100 });
  light('light.kitchen_downlights', 'kitchen', 'Kitchen Downlights', true, 100);
  light('light.kitchen_under_cabinet', 'kitchen', 'Kitchen Under Cabinet', false, 0);
  therm('climate.kitchen', 'kitchen', 'Kitchen', 19.2, 20, true);
  media('media_player.kitchen_speaker', 'kitchen', 'Kitchen Speaker', 'paused', 'Morning Mix', 'Radio');
  sw('switch.kitchen_coffee_machine', 'kitchen', 'Kitchen Coffee Machine', false);
  sw('switch.kitchen_dishwasher', 'kitchen', 'Kitchen Dishwasher', true);
  bs('binary_sensor.kitchen_motion', 'kitchen', 'Kitchen Motion', 'motion', false, 12);
  bs('binary_sensor.kitchen_smoke', 'kitchen', 'Kitchen Smoke', 'smoke', false, 900);
  light('light.dining_room_pendant', 'dining_room', 'Dining Room Pendant', false, 0);
  therm('climate.dining_room', 'dining_room', 'Dining Room', 18.1, 19, true);
  bs('binary_sensor.dining_room_window', 'dining_room', 'Dining Room Window', 'window', false, 300);
  light('light.hall', 'hall', 'Hall Light', false, 0, 'onoff');
  bs('binary_sensor.front_door', 'hall', 'Front Door', 'door', false, 25);
  bs('binary_sensor.hall_motion', 'hall', 'Hall Motion', 'motion', false, 25);
  add('alarm_control_panel.house', 'hall', 'disarmed', { friendly_name: 'House Alarm', supported_features: 7, code_format: 'number', code_arm_required: false });
  light('light.utility', 'utility', 'Utility Light', false, 0, 'onoff');
  sw('switch.utility_washing_machine', 'utility', 'Utility Washing Machine', true);
  add('water_heater.boiler', 'utility', 'auto', { friendly_name: 'Boiler', operation_mode: 'auto', operation_list: ['auto', 'on', 'off', 'boost_30', 'boost_60', 'boost_120'], current_temperature: 55, temperature: 60 });
  bs('binary_sensor.back_door', 'utility', 'Back Door', 'door', false, 140);
  // First floor
  light('light.main_bedroom_ceiling', 'main_bedroom', 'Main Bedroom Ceiling', false, 0);
  light('light.main_bedroom_bedside_left', 'main_bedroom', 'Main Bedroom Bedside Left', false, 0, 'rgb');
  light('light.main_bedroom_bedside_right', 'main_bedroom', 'Main Bedroom Bedside Right', false, 0, 'rgb');
  therm('climate.main_bedroom', 'main_bedroom', 'Main Bedroom', 18.6, 18, false);
  media('media_player.main_bedroom_speaker', 'main_bedroom', 'Main Bedroom Speaker', 'idle', null, null);
  add('fan.main_bedroom_fan', 'main_bedroom', 'off', { friendly_name: 'Main Bedroom Fan', percentage: 0, percentage_step: 25 });
  add('cover.main_bedroom_blind', 'main_bedroom', 'closed', { friendly_name: 'Main Bedroom Blind', current_position: 0 });
  light('light.kids_room_ceiling', 'kids_room', "Kids' Room Ceiling", false, 0);
  light('light.kids_room_night_light', 'kids_room', "Kids' Room Night Light", true, 15, 'rgb');
  therm('climate.kids_room', 'kids_room', "Kids' Room", 19.8, 19.5, false);
  bs('binary_sensor.kids_room_window', 'kids_room', "Kids' Room Window", 'window', true, 18);
  light('light.office_desk_lamp', 'office', 'Office Desk Lamp', true, 80);
  light('light.office_ceiling', 'office', 'Office Ceiling', false, 0);
  therm('climate.office', 'office', 'Office', 22.3, 21, false);
  sw('switch.office_monitor', 'office', 'Office Monitor', true);
  sw('switch.office_printer', 'office', 'Office Printer', false);
  bs('binary_sensor.office_motion', 'office', 'Office Motion', 'motion', true, 2);
  light('light.bathroom', 'bathroom', 'Bathroom Light', false, 0);
  add('switch.bathroom_towel_rail', 'bathroom', 'on', { friendly_name: 'Bathroom Towel Rail' });
  therm('climate.bathroom', 'bathroom', 'Bathroom', 23.6, 22, false);
  bs('binary_sensor.bathroom_moisture', 'bathroom', 'Bathroom Leak', 'moisture', false, 2000);
  light('light.landing', 'landing', 'Landing Light', false, 0);
  bs('binary_sensor.landing_motion', 'landing', 'Landing Motion', 'motion', false, 60);
  // Outside
  light('light.garden_festoon', 'garden', 'Garden Festoon Lights', false, 0, 'onoff');
  sw('switch.garden_fountain', 'garden', 'Garden Fountain', false);
  bs('binary_sensor.garden_gate', 'garden', 'Garden Gate', 'opening', false, 400);
  cam('camera.garden', 'garden', 'Garden Camera', svgUri(CAM_GARDEN));
  light('light.driveway_floodlight', 'driveway', 'Driveway Floodlight', false, 0, 'onoff');
  bs('binary_sensor.driveway_motion', 'driveway', 'Driveway Motion', 'motion', false, 6);
  bs('binary_sensor.doorbell_ding', 'driveway', 'Doorbell Ding', 'occupancy', false, 300);
  entities['binary_sensor.doorbell_ding'].hidden = true;           // the doorbell button itself: not a thing for the ring
  cam('camera.front_door', 'driveway', 'Front Door Camera', svgUri(CAM_FRONT));
  // More kinds of device (v1.3): every device with a room is on the ring
  const devices = {};
  const onDevice = (id, name, area, eids) => { devices[id] = { id, name, name_by_user: null, area_id: area }; for (const e of eids) entities[e].device_id = id; };
  add('lock.front_door', 'hall', 'locked', { friendly_name: 'Front Door Lock' });
  bs('binary_sensor.hall_co', 'hall', 'Hall CO Alarm', 'carbon_monoxide', false, 4000);
  bs('binary_sensor.kitchen_leak', 'kitchen', 'Kitchen Sink Leak', 'moisture', false, 3000);
  add('vacuum.robot', 'living_room', 'docked', { friendly_name: 'Robot Vacuum', battery_level: 100, fan_speed: 'standard' });
  add('valve.water_main', 'utility', 'open', { friendly_name: 'Water Main' });
  // a sensor-only device: no kind of its own, so it is shown by its temperature, with the rest as readings
  add('sensor.office_climate_temperature', 'office', '22.1', { friendly_name: 'Office Climate Sensor Temperature', unit_of_measurement: '°C', device_class: 'temperature' });
  add('sensor.office_climate_humidity', 'office', '51', { friendly_name: 'Office Climate Sensor Humidity', unit_of_measurement: '%', device_class: 'humidity' });
  add('sensor.office_climate_battery', 'office', '88', { friendly_name: 'Office Climate Sensor Battery', unit_of_measurement: '%', device_class: 'battery' });
  onDevice('dev_office_climate', 'Office Climate Sensor', 'office', ['sensor.office_climate_temperature', 'sensor.office_climate_humidity', 'sensor.office_climate_battery']);
  // a plug's readings go on its card
  add('sensor.office_monitor_power', 'office', '38', { friendly_name: 'Office Monitor Power', unit_of_measurement: 'W', device_class: 'power' });
  add('sensor.office_monitor_energy', 'office', '12.4', { friendly_name: 'Office Monitor Energy', unit_of_measurement: 'kWh', device_class: 'energy' });
  onDevice('dev_monitor_plug', 'Office Monitor', 'office', ['switch.office_monitor', 'sensor.office_monitor_power', 'sensor.office_monitor_energy']);
  // a hub with no kind of its own: shown under Other
  add('remote.tv_hub', 'living_room', 'on', { friendly_name: 'TV Hub', current_activity: 'Watch TV' });
  add('select.tv_hub_activity', 'living_room', 'Watch TV', { friendly_name: 'TV Hub Activity', options: ['Watch TV', 'Listen to music', 'PowerOff'] });
  onDevice('dev_tv_hub', 'TV Hub', 'living_room', ['remote.tv_hub', 'select.tv_hub_activity']);
  // Energy (shown under "By system")
  add('sensor.solar_power', 'utility', '2140', { friendly_name: 'Solar Power', unit_of_measurement: 'W', device_class: 'power' });
  add('sensor.battery_power', 'utility', '860', { friendly_name: 'Battery Power', unit_of_measurement: 'W', device_class: 'power' });
  add('sensor.battery_level', 'utility', '74', { friendly_name: 'Battery Level', unit_of_measurement: '%', device_class: 'battery' });
  add('sensor.grid_power', 'utility', '-420', { friendly_name: 'Grid Power', unit_of_measurement: 'W', device_class: 'power' });
  add('sensor.house_load', 'utility', '860', { friendly_name: 'House Load', unit_of_measurement: 'W', device_class: 'power' });
  // Scenes (no room needed)
  for (const [id, name, m] of [['morning', 'Morning', 600], ['evening', 'Cosy Evening', 95], ['movie', 'Movie Night', 3000], ['bedtime', 'Bedtime', 1500], ['away', 'Away', 9000], ['all_off', 'All Off', 2000]]) {
    states['scene.' + id] = { entity_id: 'scene.' + id, state: ago(m), attributes: { friendly_name: name }, last_changed: ago(m), last_updated: ago(m) };
    entities['scene.' + id] = { entity_id: 'scene.' + id, area_id: null, device_id: null, hidden: false, entity_category: null };
  }
  // the voice helper (optional feature)
  states['input_text.home_ring_focus'] = { entity_id: 'input_text.home_ring_focus', state: '', attributes: {}, last_changed: ago(500), last_updated: ago(500) };

  const SCENES = {
    'scene.evening': { 'light.living_room_ceiling': ['on', 40], 'light.living_room_floor_lamp': ['on', 60], 'light.kitchen_downlights': ['off'], 'light.office_desk_lamp': ['off'] },
    'scene.all_off': Object.fromEntries(Object.keys(states).filter(e => e.startsWith('light.')).map(e => [e, ['off']])),
    'scene.bedtime': Object.assign(Object.fromEntries(Object.keys(states).filter(e => e.startsWith('light.')).map(e => [e, ['off']])), { 'light.main_bedroom_bedside_left': ['on', 20] }),
  };

  function makeHass(onChange) {
    let hass;
    const set = (eid, state, attrs) => {
      const old = hass.states[eid]; if (!old) return;
      const t = new Date().toISOString();
      hass.states = Object.assign({}, hass.states, { [eid]: { ...old, state, attributes: Object.assign({}, old.attributes, attrs || {}), last_changed: state !== old.state ? t : old.last_changed, last_updated: t } });
    };
    const lightOn = (eid, d) => {
      const a = hass.states[eid].attributes, modes = a.supported_color_modes || [];
      const bri = d.brightness_pct != null ? Math.round(d.brightness_pct * 2.55) : a.brightness || (modes[0] === 'onoff' ? null : 200);
      set(eid, 'on', Object.assign({ brightness: modes[0] === 'onoff' ? null : bri }, d.hs_color ? { hs_color: d.hs_color, color_mode: 'hs' } : {}, d.color_temp_kelvin ? { color_temp_kelvin: d.color_temp_kelvin, color_mode: 'color_temp' } : {}, d.effect ? { effect: d.effect } : {}));
    };
    const ids = d => [].concat(d.entity_id || []);
    hass = {
      states: Object.assign({}, states), entities, devices, areas, floors,
      user: { name: 'Demo' }, language: 'en',
      callService(domain, service, data) {
        data = data || {};
        for (const eid of ids(data)) {
          const st = hass.states[eid]; if (!st) continue;
          if (domain === 'scene') {
            set(eid, new Date().toISOString());
            for (const [e, [s, b]] of Object.entries(SCENES[eid] || {})) { if (s === 'on') lightOn(e, { brightness_pct: b }); else set(e, 'off', { brightness: null }); }
          }
          else if (service === 'toggle') { if (eid.startsWith('light.') && st.state !== 'on') lightOn(eid, {}); else set(eid, st.state === 'on' ? 'off' : 'on'); }
          else if (service === 'turn_on') { if (domain === 'light') lightOn(eid, data); else set(eid, domain === 'media_player' ? 'idle' : 'on'); }
          else if (service === 'turn_off') set(eid, 'off', domain === 'light' ? { brightness: null } : {});
          else if (service === 'set_temperature') set(eid, st.state, { temperature: data.temperature, hvac_action: data.temperature > st.attributes.current_temperature ? 'heating' : 'idle' });
          else if (service === 'set_hvac_mode') set(eid, data.hvac_mode);
          else if (service === 'set_preset_mode') set(eid, st.state, { preset_mode: data.preset_mode });
          else if (service === 'set_operation_mode') set(eid, data.operation_mode.startsWith('boost') ? 'on' : data.operation_mode, { operation_mode: data.operation_mode });
          else if (service === 'media_play_pause') set(eid, st.state === 'playing' ? 'paused' : 'playing');
          else if (service === 'media_pause') set(eid, st.state === 'playing' ? 'paused' : st.state);
          else if (service === 'volume_set') set(eid, st.state, { volume_level: data.volume_level });
          else if (service === 'set_percentage') set(eid, data.percentage ? 'on' : 'off', { percentage: data.percentage });
          else if (/^(open|close|stop)_cover$/.test(service)) set(eid, service === 'open_cover' ? 'open' : service === 'close_cover' ? 'closed' : st.state, { current_position: service === 'open_cover' ? 100 : service === 'close_cover' ? 0 : st.attributes.current_position });
          else if (service === 'set_cover_position') set(eid, data.position > 0 ? 'open' : 'closed', { current_position: data.position });
          else if (service.startsWith('alarm_arm_')) set(eid, 'armed_' + service.slice(10));
          else if (domain === 'lock') set(eid, service === 'lock' ? 'locked' : 'unlocked');
          else if (domain === 'valve') set(eid, service === 'open_valve' ? 'open' : service === 'close_valve' ? 'closed' : st.state);
          else if (domain === 'vacuum') set(eid, service === 'start' ? 'cleaning' : service === 'pause' ? 'paused' : 'returning');
          else if (domain === 'select') set(eid, data.option);
        }
        onChange(hass = Object.assign({}, hass));
        return Promise.resolve();
      },
      setState(eid, state) { set(eid, state); onChange(hass = Object.assign({}, hass)); },   // demo events (doorbell, motion, voice)
      callApi(method, path) {                       // 24 h of made-up history for the thermostat graph
        const m = /filter_entity_id=([^&]+)/.exec(path), eid = m && decodeURIComponent(m[1]), st = eid && hass.states[eid];
        if (!st) return Promise.resolve([[]]);
        const out = [], a = st.attributes;
        for (let i = 0; i <= 48; i++) {
          const t = new Date(Date.now() - (48 - i) * 30 * 60000).toISOString(), hr = new Date(t).getHours();
          const tgt = hr >= 7 && hr < 22 ? (a.temperature || 20) : (a.temperature || 20) - 3;
          const cur = +(tgt - 0.6 + Math.sin(i / 3) * 0.7).toFixed(1);
          out.push(eid.startsWith('climate.') ? { last_changed: t, attributes: { current_temperature: cur, temperature: tgt, hvac_action: cur < tgt - 0.3 ? 'heating' : 'idle' } } : { last_changed: t, state: i % 9 === 0 ? 'on' : 'off' });
        }
        return Promise.resolve([out]);
      },
    };
    return hass;
  }
  window.HomeRingDemo = { makeHass };
})();
