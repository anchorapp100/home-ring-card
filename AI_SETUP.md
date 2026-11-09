# Set up Home Ring with an AI assistant

You can ask an AI assistant (Claude, ChatGPT, Gemini or similar) to write your Home Ring card for you. It needs a list of your rooms and devices. Home Assistant can make that list, and nothing has to be installed first.

## 1. Make the list

1. In Home Assistant, open **Developer tools → Template**.
2. Clear the template box. Paste in everything from [`extras/inventory.jinja`](extras/inventory.jinja).
3. The result appears on the right. Copy all of it.

The list holds your room names, device names and entity ids. It holds no passwords, tokens or addresses. Read it before you share it, and delete any line you'd rather keep private.

## 2. Ask the AI

Start a new chat. Paste the prompt below, then paste your list underneath it.

````text
You are helping me set up the Home Ring card for Home Assistant (github.com/anchorapp100/home-ring-card).
Home Ring shows my home as a ring I drill into: Home > floors > rooms > kinds of thing > things.
It reads Home Assistant's own floors, areas and entities, so every device needs a room (area), and
rooms should have a floor.

Below this prompt is an inventory from my Home Assistant. Use ONLY entity ids that appear in it. Never
invent an entity id. If something you need is missing, ask me.

First, ask me these questions in one short message, then wait for my answers:
1. Where will the ring go: a wall tablet (full screen), a normal dashboard, or both? On a phone too?
2. Are any of these devices the tablet or screen the dashboard runs on? Its own lights, cameras and
   switches should be left out. Name the ones you think they are.
3. Which camera goes with which doorbell, and which motion sensors watch each camera's area? Suggest
   pairs from the inventory.
4. For heating: if there is a water_heater with modes such as boost_60, which mode should a long press
   on the Heating button use (or none)?
5. For the Energy view: which power sensors are solar, home battery (power and charge %), grid and
   house use? Suggest them, and say which way the grid and battery signs probably go.
6. Do I want the voice add-on ("show me the kitchen")?

Then give me, in this order:

A. ROOM FIXES. Look at "THINGS WITHOUT A ROOM" and rooms marked "(no floor)". List the things that
   look like they belong in a room, with the room you suggest, and the rooms that need a floor.
   Tell me how: Settings > Areas, labels & zones (rooms and floors), or a device's page > the pencil
   (its room). Don't suggest moving anything I said was the tablet.

B. THE CARD. One YAML block I can paste into a card's code editor. Options:
   type: custom:home-ring-card       (required)
   height: CSS height of the card, e.g. "calc(100vh - 16px)" for a full-screen panel view,
           default "min(78vh, 760px)"; for mini, default 220px
   mini: true                         a small summary card that opens the full ring when tapped
   navigation_path: /dashboard/view   where the mini card goes when tapped
   back_path: /dashboard/view         adds a "← Back" button (label set with back_label)
   mode: rooms | systems              starting view (people can switch; their choice is remembered)
   exclude: [list]                    leave things out. "light.tablet_*" or "*_segment_*" = entity id
                                      pattern; a plain word such as "screen" = matched in the name
   exclude_areas: [list]              rooms to leave out, by name or id
   strip_prefixes: [list]             words to drop from the start of names, e.g. a brand
   lights_exclude: [list]             lights left out of "all on / all off" and room holds
   scenes: true | false | [list]      the band of scenes around the ring (default: all scenes)
   hot_buttons: true | false          the four corner buttons (Cameras, Lights, Alarm, Heating)
   cameras: list of {name, entity or entities: [main, fallback], doorbell, motion: [list]}
           (default: every camera that has a room, with that room's motion sensors)
   camera_refresh: seconds between stills (default 2)
   cameras_path / alarm_path: a dashboard view to open instead of the built-in pop-ups
   alarm: alarm_control_panel entity (default: the first one)
   heating: {entity: water_heater..., hold_mode: boost_60}
   energy: list of {entity, name, kind: solar|battery|battery_level|grid|load|other, invert: true}
           battery: positive = charging. grid: positive = importing. Use invert: true if mine is the
           other way round. These appear under "By system > Energy".
   voice_entity: input_text.home_ring_focus   only with the voice add-on
   temperature_tint: true | false; comfort_temperature (default 20.5); temperature_span (default 4)
   motion_pulse: true | false
   Leave out any option whose default is fine. Keep the YAML short and valid.

C. WHERE TO PUT IT. For a wall tablet: a new dashboard view with "panel: true" holding just this
   card. For a normal dashboard: add the card, or a mini card that opens the full view.
   Give the view YAML if I asked for a full-screen view.

D. VOICE (only if I said yes). Tell me to copy two files from the repo's extras/voice folder:
   home_ring_voice.yaml into my packages folder (and how to turn packages on if I haven't), and
   custom_sentences/en/home_ring.yaml into <config>/custom_sentences/en/. Then restart Home
   Assistant, and add voice_entity: input_text.home_ring_focus to the card.

E. CHECKS. A short list of things to try: tap a room, hold a room (lights), slide on a dimmable light,
   tap each corner button.

Keep your answers short and plain. Explain any Home Assistant term the first time you use it.

INVENTORY:
````

## 3. Use what it gives you

- **Room fixes** are made in Home Assistant itself. The ring updates within a second or two of each change.
- **The card**: open a dashboard, choose **Edit dashboard → Add card → Manual**, and paste the YAML.
- If the card shows an error, paste the error back into the same chat. The AI can fix its own YAML.
